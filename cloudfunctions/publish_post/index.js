// 云函数入口文件
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const { imageUrl, prompt, userInfo } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!imageUrl) {
    return { code: -1, message: 'Image URL is required' };
  }

  try {
    // 1. Download the image from the external URL
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    const buffer = Buffer.from(response.data, 'binary');

    // 2. Upload to Cloud Storage
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const cloudPath = `images/${openid}_${timestamp}_${random}.png`;

    const uploadResult = await cloud.uploadFile({
      cloudPath: cloudPath,
      fileContent: buffer,
    });

    // 3. Save metadata to Database
    const fileID = uploadResult.fileID;
    
    // Ensure collection exists
    try {
      await db.createCollection('images');
    } catch (e) {
      // Ignore error if collection already exists
    }

    const dbResult = await db.collection('images').add({
      data: {
        _openid: openid,
        fileID: fileID,
        originalUrl: imageUrl, // Optional: keep the original URL
        prompt: prompt,
        userInfo: userInfo, // Store snapshot of user info
        createTime: db.serverDate()
      }
    });

    return {
      code: 0,
      message: 'Published successfully',
      data: {
        id: dbResult._id,
        fileID: fileID
      }
    };

  } catch (err) {
    console.error(err);
    return {
      code: -1,
      message: err.message || 'Failed to publish post',
      error: err
    };
  }
};