const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

const API_KEY = process.env.DASHSCOPE_API_KEY;
const MAX_DAILY_LIMIT = 5;
const DEVELOPER_OPENID = 'oEBBt5aD7EmrCgEXUUYkT3lo8Hds';

exports.main = async (event, context) => {
  const { type, payload } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!API_KEY) {
    return {
      code: -1,
      message: 'Missing DASHSCOPE_API_KEY environment variable'
    };
  }

  try {
    if (type === 'create') {
      // Check daily limit
      const checkResult = await checkDailyLimit(openid);
      if (!checkResult.allowed) {
        return {
          code: -2,
          message: `今日生成次数已达上限 (${checkResult.count}/${MAX_DAILY_LIMIT})`
        };
      }

      const result = await createTask(payload);
      
      // If task created successfully, increment count
      if (result.code === 0) {
        await incrementDailyCount(openid);
      }
      
      return result;
    } else if (type === 'query') {
      return await queryTask(payload);
    } else {
      return {
        code: -1,
        message: 'Unknown type'
      };
    }
  } catch (err) {
    console.error(err);
    return {
      code: -1,
      message: err.message,
      error: err.response ? err.response.data : err
    };
  }
};

async function checkDailyLimit(openid) {
  if (openid === DEVELOPER_OPENID) {
    return { allowed: true, count: 0 };
  }

  const todayStr = getBeijingDateStr();

  try {
    const res = await db.collection('daily_usage').where({
      _openid: openid,
      date: todayStr
    }).get();

    if (res.data.length > 0) {
      const count = res.data[0].count;
      if (count >= MAX_DAILY_LIMIT) {
        return { allowed: false, count };
      }
      return { allowed: true, count };
    }
    return { allowed: true, count: 0 };
  } catch (e) {
    // If collection doesn't exist, we assume it's the first time and allow it
    // We will handle collection creation in increment step
    return { allowed: true, count: 0 };
  }
}

async function incrementDailyCount(openid) {
  if (openid === DEVELOPER_OPENID) return;

  const todayStr = getBeijingDateStr();

  try {
    // Ensure collection exists
    try {
      await db.createCollection('daily_usage');
    } catch (e) {
      // Ignore if already exists
    }

    const res = await db.collection('daily_usage').where({
      _openid: openid,
      date: todayStr
    }).get();

    if (res.data.length > 0) {
      await db.collection('daily_usage').doc(res.data[0]._id).update({
        data: {
          count: _.inc(1)
        }
      });
    } else {
      await db.collection('daily_usage').add({
        data: {
          _openid: openid,
          date: todayStr,
          count: 1
        }
      });
    }
  } catch (e) {
    console.error('Increment count error', e);
  }
}

function getBeijingDateStr() {
  const date = new Date();
  // Adjust to Beijing Time (UTC+8)
  // Note: This is a simplified adjustment. 
  // In production, might want to check server timezone.
  // Assuming server is UTC.
  const offset = 8;
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const beijingDate = new Date(utc + (3600000 * offset));
  
  return `${beijingDate.getFullYear()}-${String(beijingDate.getMonth() + 1).padStart(2, '0')}-${String(beijingDate.getDate()).padStart(2, '0')}`;
}

async function createTask(payload) {
  const { prompt, negativePrompt } = payload;
  
  const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
  
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'X-DashScope-Async': 'enable',
    'Content-Type': 'application/json'
  };

  const body = {
    model: 'wanx2.1-t2i-plus',
    input: {
      prompt: prompt
    },
    parameters: {
      size: '1024*1024',
      n: 1
    }
  };

  if (negativePrompt) {
    body.parameters.negative_prompt = negativePrompt;
  }

  const response = await axios.post(url, body, { headers });
  return {
    code: 0,
    data: response.data
  };
}

async function queryTask(payload) {
  const { taskId } = payload;
  
  const url = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
  
  const headers = {
    'Authorization': `Bearer ${API_KEY}`
  };

  const response = await axios.get(url, { headers });
  return {
    code: 0,
    data: response.data
  };
}
