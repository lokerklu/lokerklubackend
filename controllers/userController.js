import User from "../models/User.js";
import Lokers from "../models/Lokers.js";
import Company from "../models/Company.js";
import { remove, store } from "../utils/VercelBlob.js";
import {
  genPass,
  genToken,
  getPublic,
  generatePrimes,
  verifyPass,
  verifyJwtToken,
} from "../generate/genPass.js";

export const userAuth = async (req, res) => {
  try {
    const isTokenvalid = verifyJwtToken(req.body.Token);
    if (isTokenvalid) {
      const query1 = { _id: isTokenvalid.id };
      const query2 = { auth_token: false };
      await User.find(query1, query2)
        .then(async (result) => {
          if (result.length) {
            const query1 = { "addres.kec": { $regex: new RegExp(result[0].addres.kec,'i') } };
            const query2 = { "addres.kec": { $regex: new RegExp(result[0].addres.kec,'i') } };
            const lokers = await Lokers.find(query1).limit(5);
            const companies = await Company.find(query2).limit(5);
            const secureUser = verifyPass(
              result[0].password,
              isTokenvalid.password
            );
            if (secureUser) {
              result[0].password = "";
              res.json({
                code: 200,
                status: "OK",
                user: result,
                lokers,
                companies
              });
            } else {
              res.json({
                code: 404,
                status: "NOT_FOUND",
                errors: ["tidak terauthentication !!!"],
              });
            }
          } else {
            res.json({
              code: 404,
              status: "NOT_FOUND",
              errors: ["tidak terauthentication !!!"],
            });
          }
        })
        .catch(() => {
          res.json({
            code: 404,
            status: "NOT_FOUND",
            errors: ["tidak terauthentication !!!"],
          });
        });
    } else {
      res.json({
        code: 404,
        status: "NOT_FOUND",
        errors: ["tidak terauthentication !!!"],
      });
    }
  } catch (error) {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      errors: ["tidak terauthentication !!!"],
    });
  }
};

export const userGoogleLogin = async (req, res) => {
  try {
    const query = { email: req.body.email };
    const isDuplicate = await User.find(query);
    if (!isDuplicate.length) {
      const hashPass = genPass(req.body.email);
      const priv = generatePrimes()
      const publ = getPublic(priv)
      const data = {
        key: {
          private: priv, 
          public: publ 
        },
        fullname: req.body.fullname,
        email: req.body.email,
        password: hashPass,
      };
      await User.insertMany(data)
        .then(async (result) => {
          if (result.length) {
            const token = genToken(result[0]._id, req.body.email);
            const query1 = { _id: result[0]._id };
            const query2 = { auth_token: token };
            await User.updateMany(query1, query2)
              .then(async (result2) => {
                if (result2.modifiedCount > 0) {
                  const query1 = { "addres.kec": { $regex: new RegExp(result[0].addres.kec,'i') } };
                  const query2 = { "addres.kec": { $regex: new RegExp(result[0].addres.kec,'i') } };
                  const lokers = await Lokers.find(query1).limit(5);
                  const companies = await Company.find(query2).limit(5);
                  const user = {
                    fullname: result[0].fullname,
                    email: result[0].email,
                    auth_token: token,
                  };
                  res.json({
                    code: 200,
                    status: "OK",
                    user: [user],
                    lokers,
                    companies,
                    mssg: "login akun user berhasil",
                  });
                } else {
                  res.json({
                    code: 500,
                    status: "FAILED",
                    errors: ["login dengan google gagal 4 !!!"],
                  });
                }
              })
              .catch((err) => {
                res.json({
                  code: 500,
                  status: "FAILED",
                  errors: ["login dengan google gagal 3 !!!"],
                });
              });
          } else {
            res.json({
              code: 500,
              status: "FAILED",
              errors: ["login dengan google gagal 2 !!!"],
            });
          }
        })
        .catch(() => {
          res.json({
            code: 500,
            status: "FAILED",
            errors: ["login dengan google gagal 1 !!!"],
          });
        });
    } else {
      const auth = verifyPass(isDuplicate[0].password, req.body.email);
      if (auth) {
        const token = genToken(isDuplicate[0]._id, req.body.email);
        const query1 = { _id: isDuplicate[0]._id };
        const query2 = { auth_token: token };
        await User.updateMany(query1, query2)
          .then(async (result2) => {
            if (result2.modifiedCount > 0) {
              const query1 = { "addres.kec": { $regex: new RegExp(isDuplicate[0].addres.kec,'i') } };
              const query2 = { "addres.kec": { $regex: new RegExp(isDuplicate[0].addres.kec,'i') } };
              const lokers = await Lokers.find(query1).limit(5);
              const companies = await Company.find(query2).limit(5);
              const user = {
                fullname: isDuplicate[0].fullname,
                email: isDuplicate[0].email,
                auth_token: token,
              };
              res.json({
                code: 200,
                status: "OK",
                user: [user],
                lokers,
                companies,
                mssg: "login akun user berhasil",
              });
            } else {
              res.json({
                code: 500,
                status: "FAILED",
                errors: ["login dengan google gagal !!!"],
              });
            }
          })
          .catch(() => {
            res.json({
              code: 500,
              status: "FAILED",
              errors: ["login dengan google gagal !!!"],
            });
          });
      } else {
        res.json({
          code: 500,
          status: "FAILED",
          errors: ["login dengan google gagal !!!"],
        });
      }
    }
  } catch (err){
    res.json({
      code: 500,
      status: "FAILED",
      errors: ["login dengan google gagal !!!"],
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const query1 = { _id: req.body._id };
    const query2 = {
      fullname: req.body.fullname,
      study: req.body.study,
      addres: req.body.addres,
    };
    const update = await User.updateMany(query1, query2);
    const user = await User.find(query1);
    if (update.modifiedCount > 0) {
      res.json({
        code: 200,
        status: "OK",
        user,
        mssg: "proccess update profile berhasil.",
      });
    } else {
      res.json({
        code: 500,
        status: "PROCESS_FAILED",
        errors: ["proccess update profile gagal !!!"],
      });
    }
  } catch (error) {
    res.json({
      code: 500,
      status: "PROCESS_FAILED",
      errors: ["proccess update profile gagal !!!"],
    });
  }
};

export const updateUserCv = async (req, res) => {
  try {
    if (req.files.file) {
      const query1 = { _id: req.body.user_id };
      const query3 = { password: 0, auth_token: 0 };
      var user = await User.find(query1, query3);
      if (user[0].cv.file) {
        const deleteOldCv = await remove(user[0].cv.file);
        if (deleteOldCv.status == 200) {
          const fileURL = await store(req.files.file[0]);
          const dataCV = {
            filename: req.files.file[0].originalname,
            file: fileURL.url,
            downloadURL: fileURL.downloadUrl,
            time: req.body.time,
            size: req.files.file[0].size,
          };
          const query2 = { $set: { cv: dataCV } };
          const update = await User.updateMany(query1, query2);
          if (update.modifiedCount) {
            user = await User.find(query1, query3);
            res.json({
              code: 200,
              status: "OK",
              mssg: "proses mengubah data cv berhasil.",
              user,
            });
          } else {
            res.json({
              code: 500,
              status: "PROCESS_FAILED",
              errors: ["proses mengubah data cv gagal !!!"],
            });
          }
        } else {
          res.json({
            code: 500,
            status: "PROCESS_FAILED",
            errors: ["proses mengubah data cv gagal !!!"],
          });
        }
      } else {
        const fileURL = await store(req.files.file[0]);
        const dataCV = {
          filename: req.files.file[0].originalname,
          file: fileURL.url,
          downloadURL: fileURL.downloadUrl,
          time: req.body.time,
          size: req.files.file[0].size,
        };
        const query2 = { $set: { cv: dataCV } };
        const update = await User.updateMany(query1, query2);
        if (update.modifiedCount) {
          user = await User.find(query1, query3);
          res.json({
            code: 200,
            status: "OK",
            mssg: "proses mengubah data cv berhasil.",
            user,
          });
        } else {
          res.json({
            code: 500,
            status: "PROCESS_FAILED",
            errors: ["proses mengubah data cv gagal !!!"],
          });
        }
      }
    } else {
      res.json({
        code: 500,
        status: "PROCESS_FAILED",
        errors: ["proses mengubah data cv gagal !!!"],
      });
    }
  } catch (error) {
    res.json({
      code: 500,
      status: "PROCESS_FAILED",
      errors: ["proses mengubah data cv gagal !!!"],
    });
  }
};

export const updateUserPlus = async (req, res) => {
  const query1 = { _id: req.body.user_id };
  const query3 = { password: 0, auth_token: 0 };
  var user = await User.find(query1, query3);
  if (user[0].plus.length) {
    user[0].plus.map(async (plus) => {
      await remove(plus.file);
    });
  }
  if (req.files.plus1 && req.files.plus2 && req.files.plus3) {
    let file = [];
    let add1 = await store(req.files.plus1[0]);
    let add2 = await store(req.files.plus2[0]);
    let add3 = await store(req.files.plus3[0]);
    file.push({
      filename: req.files.plus1[0].originalname,
      downloadURL: add1.downloadUrl,
      file: add1.url,
    });
    file.push({
      filename: req.files.plus2[0].originalname,
      downloadURL: add2.downloadUrl,
      file: add2.url,
    });
    file.push({
      filename: req.files.plus3[0].originalname,
      downloadURL: add3.downloadUrl,
      file: add3.url,
    });
    if (file.length) {
      const query2 = { $set: { plus: file } };
      let update = await User.updateMany(query1, query2);
      if (update.modifiedCount) {
        user = await User.find(query1, query3);
        res.json({
          code: 200,
          status: "OK",
          user,
          mssg: "proses mengubah data file pendukung berhasil.",
        });
      } else {
        res.json({
          code: 500,
          status: "PROCESS_FAILED",
          errors: ["proses mengubah data file pendukung gagal !!!"],
        });
      }
    } else {
      res.json({
        code: 500,
        status: "PROCESS_FAILED",
        errors: ["proses mengubah data file pendukung gagal !!!"],
      });
    }
  } else if (req.files.plus1 && req.files.plus2) {
    let file = [];
    let add1 = await store(req.files.plus1[0]);
    let add2 = await store(req.files.plus2[0]);
    file.push({
      filename: req.files.plus1[0].originalname,
      downloadURL: add1.downloadUrl,
      file: add1.url,
    });
    file.push({
      filename: req.files.plus2[0].originalname,
      downloadURL: add2.downloadUrl,
      file: add2.url,
    });
    if (file.length) {
      const query2 = { $set: { plus: file } };
      let update = await User.updateMany(query1, query2);
      if (update.modifiedCount) {
        user = await User.find(query1, query3);
        res.json({
          code: 200,
          status: "OK",
          user,
          mssg: "proses mengubah data file pendukung berhasil.",
        });
      } else {
        res.json({
          code: 500,
          status: "PROCESS_FAILED",
          errors: ["proses mengubah data file pendukung gagal !!!"],
        });
      }
    } else {
      res.json({
        code: 500,
        status: "PROCESS_FAILED",
        errors: ["proses mengubah data file pendukung gagal !!!"],
      });
    }
  } else { 
    let file = [];
    let add1 = await store(req.files.plus1[0]);
    file.push({
      filename: req.files.plus1[0].originalname,
      downloadURL: add1.downloadUrl,
      file: add1.url,
    });
    if (file.length) {
      const query2 = { $set: { plus: file } };
      let update = await User.updateMany(query1, query2);
      if (update.modifiedCount) {
        user = await User.find(query1, query3);
        res.json({
          code: 200,
          status: "OK",
          user,
          mssg: "proses mengubah data file pendukung berhasil.",
        });
      } else {
        res.json({
          code: 500,
          status: "PROCESS_FAILED",
          errors: ["proses mengubah data file pendukung gagal !!!"],
        });
      }
    } else {
      res.json({
        code: 500,
        status: "PROCESS_FAILED",
        errors: ["proses mengubah data file pendukung gagal !!!"],
      });
    }
  }
};
