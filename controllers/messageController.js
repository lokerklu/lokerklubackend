import dotenv from "dotenv";
import cryptoJS from "crypto-js";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Message from "../models/Message.js";
import {genCode} from "../generate/genPass.js";

dotenv.config()

export const addChatRoom = async (req, res) => {
  const userkey = req.body.key.slice(24).toString();
  const companiekey = req.body.key.slice(0, 24).toString();
  const query = { _id: userkey };
  const excep1 = { _id: 1, fullname: 1 };
  const excep2 = { _id: 1, companyName: 1, company_images: 1 };
  const query3 = { _id: companiekey };
  const query1 = { room_key: req.body.key };
  let user = await User.find(query, excep1);
  let company = await Company.find(query3, excep2);
  let users = [{user_id: user[0]._id.toString(),fullname: user[0].fullname,available: true}, {user_id: company[0]._id.toString(),companyName: company[0].companyName,company_images: company[0].company_images[0],available: true}];
  let isDuplicate = await Message.find(query1);
  if (isDuplicate.length > 0) {
    res.json({
      code: 200,
      status: "OK",
      chats: isDuplicate,
    });
  } else if (user.length && company.length) {
    let data = {
      key: {
        userPubl: user[0].key.public,
        compPubl: company[0].key.public
      },
      room_key: req.body.key,
      users: users,
    };
    Message.insertMany(data)
      .then((result) => {
        res.json({
          code: 200,
          status: "OK",
          chats: result,
        });
      })
      .catch((err) => {
        res.json({
          code: 500,
          status: "ERROR",
          errors: {
            database: ["chat room invalid", err.message],
          },
        });
      });
  } else {
    res.json({
      code: 500,
      status: "ERROR",
      errors: {
        database: ["chat room invalid", err.message],
      },
    });
  }
};

export const pushUserMessage = async (req, res) => {
  try {
    const query = { room_key: req.body.data.room_key };
    const mssg = await Message.find(query) 
    if (mssg[0].users.find(user => {return user.available == false})) {
      const query2 = { $set: {"users.$[filt].available" : true  } };
      const query3 = {arrayFilters: [{"filt.user_id": mssg[0].users[0].user_id}]}
      await Message.updateMany(query,query2,query3)
    }
    const isFull = mssg[0].messages.filter(msg => {return msg.from == req.body.data.key})
    if (isFull.length > 49) {
      res.json({
        code: 500,
        status: "ERROR",
        errors: {
          database: ["batas maksimal pengiriman adalah 50 pesan"],
        },
      });
    } else {
      const _id = {_id: genCode(24)}
      const user = await User.find({_id: mssg[0].users[0].user_id})
      const e2eKey = ((mssg[0].key.compPubl ** user[0].key.private) % process.env.M).toString()
      req.body.data.chat.text = cryptoJS.AES.encrypt(req.body.data.chat.text, e2eKey).toString();
      const dataTemp = {..._id,...req.body.data.chat}
      const query2 = { $push: { messages: dataTemp } };
      let update = await Message.updateMany(query, query2);
      if (update.modifiedCount > 0) {
        res.json({
          code: 200,
          status: "OK",
        });
      } else {
        res.json({
          code: 500,
          status: "ERROR",
          errors: {
            database: ["mengirim pesan gagal"],
          },
        });
      }
    }
  } catch (error) {
    res.json({
      code: 500,
      status: "ERROR",
      errors: {
        database: ["mengirim pesan gagal"],
      },
    });
  }
};

export const pushCompMessage = async (req, res) => {
  try {
    const query = { room_key: req.body.data.room_key };
    const mssg = await Message.find(query) 
    if (mssg[0].users.find(user => {return user.available == false})) {
      const query2 = { $set: {"users.$[filt].available" : true  } };
      const query3 = {arrayFilters: [{"filt.user_id": mssg[0].users[0].user_id}]}
      await Message.updateMany(query,query2,query3)
    }
    const isFull = mssg[0].messages.filter(msg => {return msg.from == req.body.data.key})
    if (isFull.length > 49) {
      res.json({
        code: 500,
        status: "ERROR",
        errors: {
          database: ["batas maksimal pengiriman adalah 50 pesan"],
        },
      });
    } else {
      const _id = {_id: genCode(24)}
      const comp = await Company.find({_id: mssg[0].users[1].user_id})
      const e2eKey = ((comp[0].key.private ** mssg[0].key.userPubl) % process.env.M).toString()
      req.body.data.chat.text = cryptoJS.AES.encrypt(req.body.data.chat.text, e2eKey).toString();
      const dataTemp = {..._id,...req.body.data.chat}
      const query2 = { $push: { messages: dataTemp } };
      let update = await Message.updateMany(query, query2);
      if (update.modifiedCount > 0) {
        res.json({
          code: 200,
          status: "OK",
        });
      } else {
        res.json({
          code: 500,
          status: "ERROR",
          errors: {
            database: ["mengirim pesan gagal"],
          },
        });
      }
    }
  } catch (error) {
    console.log(error);
    
    res.json({
      code: 500,
      status: "ERROR",
      errors: {
        database: ["mengirim pesan gagal"],
      },
    });
  }
};

export const readUserMessage = async (req,res) => {
  try {
    const query1 = {room_key: req.body.key}
    req.body.data.map(async data => {
      const query2 = { $set: {"messages.$[filt].read" : [req.body._id]  } };
      const query3 = {arrayFilters: [{"filt._id": data}]}
      await Message.updateMany(query1,query2,query3)
    })
  } catch (error) {
    res.json({
      code: 500,
      status: "ERROR",
      errors: [
        "prosess update gagal !!!"
      ]
    })
  }
}

export const readCompanieMessage = async (req,res) => {
  try {
    const query1 = {room_key: req.body.key}
    req.body.data.map(async data => {
      const query2 = { $set: {"messages.$[filt].read" : [req.body._id]  } };
      const query3 = {arrayFilters: [{"filt._id": data}]}
      await Message.updateMany(query1,query2,query3)
    })
  } catch (error) {
    res.json({
      code: 500,
      status: "ERROR",
      errors: [
        "prosess update gagal !!!"
      ]
    })
  }
}

export const getUserChatList = async (req, res) => {
  const query = {
    users: { $elemMatch: { user_id: req.body._id,available: true  } },
  };
  let messages = await Message.find(query);
  if (messages.length > 0) {
    res.json({
      code: 200,
      status: "OK",
      messages,
    });
  } else {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      errors: ["data tidak ada"],
    });
  }
};

export const getCompanieChatList = async (req, res) => {
  const query = {
    users: { $elemMatch: { user_id: req.body._id,available: true } },
  };
  let messages = await Message.find(query);
  if (messages.length > 0) {
    res.json({
      code: 200,
      status: "OK",
      messages,
    });
  } else {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      errors: ["data tidak ada"],
    });
  }
};

export const deleteUserChat = async (req, res) => {
  const query = {room_key: req.body.key,users: { $elemMatch: {available: false}}}
  const isformat = await Message.find(query).countDocuments()
  if (isformat) {
    const del = await Message.deleteMany(query)
    if (del.deletedCount > 0) {
      res.json({
        code: 200,
        status: "OK",
      });
    } else {
      res.json({
        code: 500,
        status: "ERROR",
        errors: {
          database: ["delete data gagal"],
        },
      });
    }
  } else {
    const userkey = req.body.key.slice(24).toString();
    const query1 = { room_key: req.body.key };
    const query2 = { $set: {"users.$[filt].available" : false  } };
    const query3 = {arrayFilters: [{"filt.user_id": userkey}]}
    let remove = await Message.updateMany(query1,query2,query3);
    if (remove.modifiedCount > 0) {
      res.json({
        code: 200,
        status: "OK",
      });
    } else {
      res.json({
        code: 500,
        status: "ERROR",
        errors: {
          database: ["delete data gagal"], 
        },
      });
    }
  }
};

export const deleteCompanieChat = async (req, res) => {
  const query = {room_key: req.body.key,users: { $elemMatch: {available: false}}}
  const isformat = await Message.find(query).countDocuments()
  if (isformat) {
    const del = await Message.deleteMany(query)
    if (del.deletedCount > 0) {
      res.json({
        code: 200,
        status: "OK",
      });
    } else {
      res.json({
        code: 500,
        status: "ERROR",
        errors: {
          database: ["delete data gagal"],
        },
      });
    }
  } else {
    const companiekey = req.body.key.slice(0, 24).toString();
    const query1 = { room_key: req.body.key };
    const query2 = { $set: {"users.$[filt].available" : false  } };
    const query3 = {arrayFilters: [{"filt.user_id": companiekey}]}
    let remove = await Message.updateMany(query1,query2,query3);
    if (remove.modifiedCount > 0) {
      res.json({
        code: 200,
        status: "OK",
      });
    } else {
      res.json({
        code: 500,
        status: "ERROR",
        errors: {
          database: ["delete data gagal"], 
        },
      });
    }
  }
}; 
