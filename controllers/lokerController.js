import dotenv from "dotenv";
import cryptoJS from "crypto-js";
import get from "request-promise";
import User from "../models/User.js"
import nodemailer from "nodemailer";
import Lokers from "../models/Lokers.js";
import Message from "../models/Message.js";
import Company from "../models/Company.js";
import {genCode} from "../generate/genPass.js";
import { IgApiClient } from "instagram-private-api";
import { store, remove, downloadfile } from "../utils/VercelBlob.js";

dotenv.config();

export const addLoker = async (req, res) => {
  if (req.file) {
    if (req.file.size <= 500000) {
      if (
        req.file.mimetype == "image/jpeg" ||
        req.file.mimetype == "image/jpg" ||
        req.file.mimetype == "image/png"
      ) {
        const blob = await store(req.file);
        if (blob) {
          let loker = {
            company_id: req.body.company_id,
            companyName: req.body.companyName,
            comp_prof: req.body.comp_prof,
            position: req.body.position,
            type: req.body.type,
            industry_type: req.body.industry_type,
            work_time: req.body.work_time,
            link_desc: req.body.link_desc,
            desc_job: [],
            sellary: {
              from: req.body.from,
              to: req.body.to,
              per: req.body.per,
            },
            addres: {
              jalan: req.body.jalan.toLowerCase(),
              kec: req.body.kec.toLowerCase(),
              kabkota: req.body.kabkota.toLowerCase(),
            },
            fileField: {
              filename: blob.pathname,
              file: blob.url,
            },
          };
          if (req.body.desc_job) {
            loker.desc_job = req.body.desc_job.split(",");
          }
          Lokers.insertMany(loker)
            .then(async (result) => {
              if (result) {
                res.json({
                  code: 200,
                  status: "OK",
                  lokers: result,
                  mssg: "mengunggah loker berhasil",
                });
              } else {
                res.json({
                  code: 500,
                  status: "SERVER_ERROR",
                  errors: ["mengunggah loker gagal !!!"],
                });
              }
            })
            .catch(() => {
              res.json({
                code: 500,
                status: "SERVER_ERROR",
                errors: ["mengunggah loker gagal !!!"],
              });
            });
        } else {
          res.json({
            code: 500,
            status: "SERVER_ERROR",
            errors: ["mengunggah loker gagal !!!"],
          });
        }
      } else {
        res.json({
          code: 500,
          status: "SERVER_ERROR",
          errors: ["format file template tidak sesuai !!!"],
        });
      }
    } else {
      res.json({
        code: 500,
        status: "SERVER_ERROR",
        errors: ["ukuran file template terlalu besar !!!"],
      });
    }
  } else {
    try {
      const loker = {
        company_id: req.body.company_id,
        companyName: req.body.companyName,
        comp_prof: req.body.comp_prof,
        position: req.body.position,
        type: req.body.type,
        industry_type: req.body.industry_type,
        work_time: req.body.work_time,
        link_desc: req.body.link_desc,
        desc_job: [],
        sellary: {
          from: req.body.from,
          to: req.body.to,
          per: req.body.per,
        },
        addres: {
          jalan: req.body.jalan.toLowerCase(),
          kec: req.body.kec.toLowerCase(),
          kabkota: req.body.kabkota.toLowerCase(),
        },
      };
      if (req.body.desc_job) {
        loker.desc_job = req.body.desc_job.split(",");
      }
      Lokers.insertMany(loker)
        .then((result) => {
          if (result.length) {
            res.json({
              code: 200,
              status: "OK",
              mssg: "mengunggah loker berhasil.",
              lokers: result,
            });
          } else {
            res.json({
              code: 500,
              status: "SERVER_ERROR",
              errors: ["mengunggah loker gagal !!!"],
            });
          }
        })
        .catch(() => {
          res.json({
            code: 500,
            status: "SERVER_ERROR",
            errors: ["mengunggah loker gagal !!!"],
          });
        });
    } catch (error) {
      res.json({
        code: 500,
        status: "SERVER_ERROR",
        errors: ["mengunggah loker gagal !!!"],
      });
    }
  }
};

export const getAllWork = async (req, res) => {
  try {
    let lokers = await Lokers.find();
    if (lokers.length) {
      res.json({
        code: 200,
        status: "OK",
        lokers: lokers,
      });
    } else {
      res.json({
        code: 404,
        status: "NOT_FOUND",
        errors: ["data not found !"],
      });
    }
  } catch (error) {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      errors: ["data not found !"],
    });
  }
};

export const getWorkById = async (req, res) => {
  try {
    let loker = await Lokers.find({ _id: req.body.id });
    if (loker.length) {
      res.json({
        code: 200,
        status: "OK",
        loker: loker,
      });
    } else {
      res.json({
        code: 404,
        status: "NOT_FOUND",
        errors: ["data tidak ditemukan !!!"],
      });
    }
  } catch (error) {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      errors: ["data tidak ditemukan !!!"],
    });
  }
};

export const getLokerRecomend = async (req, res) => {
  if (req.body._id) {
    try {
      const query = { _id: req.body._id };
      const user = await User.find(query);
      const query1 = { "addres.kec": { $regex: new RegExp(user[0].addres.kec,'i') } };
      const lokers = await Lokers.find(query1).limit(5);
      if (lokers.length) {
        res.json({
          code: 200,
          status: "OK",
          lokers,
        });
      } else {
        res.json({
          code: 404,
          status: "NOT_FOUND",
          erors: ["data tidak ditemukan !!!"],
        });
      }
    } catch (error) {
      res.json({
        code: 404,
        status: "NOT_FOUND",
        erors: ["data tidak ditemukan !!!"],
      });
    }
  } else {
    try {
      const query = {};
      let data = await Lokers.find(query);
      data.reverse();
      let lokers = [];
      data.map((data) => {
        if (lokers.length == 0 && data.position !== "") {
          lokers.push(data);
        } else {
          let index = lokers.find((object) => {
            if (object.addres.kec == data.addres.kec) return true;
            else return false;
          });
          if (!index && data.position !== "") {
            lokers.push(data);
          }
        }
      });
      res.json({
        code: 200,
        status: "OK",
        lokers,
      });
    } catch (error) {
      res.json({
        code: 404,
        status: error,
        errors: ["data tida ditemukan !!!"],
      });
    }
  }
};

export const getWorkByCompany = async (req, res) => {
  try {
    const query = { company_id: req.body._id };
    let lokers = await Lokers.find(query);
    if (lokers.length) {
      res.json({
        code: 200,
        status: "OK",
        lokers,
      });
    } else {
      res.json({
        code: 404,
        status: "NOT_FOUND",
        errors: ["data tidak ditemukan"],
      });
    }
  } catch (error) {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      errors: ["data tidak ditemukan"],
    });
  }
};

export const updateLoker = (req, res) => {
  try {
    const query1 = { _id: req.body.id };
    if (req.body.status == "open") {
      req.body.status = "close";
    } else {
      req.body.status = "open";
    }
    const query2 = { status: req.body.status };
    Lokers.updateMany(query1, query2)
      .then((result) => {
        if (result.modifiedCount > 0) {
          res.json({
            code: 200,
            status: "OK",
            statusLoker: req.body.status,
            mssg: "mengubah status loker berhasil",
          });
        } else {
          res.json({
            code: 500,
            status: "SERVER_ERROR",
            errors: ["mengubah status loker gagal !!!"],
          });
        }
      })
      .catch(() => {
        res.json({
          code: 500,
          status: "SERVER_ERROR",
          errors: ["mengubah status loker gagal !!!"],
        });
      });
  } catch (error) {
    res.json({
      code: 500,
      status: "SERVER_ERROR",
      errors: ["mengubah status loker gagal !!!"],
    });
  }
};

export const deleteLoker = async (req, res) => {
  try {
    const query = { _id: req.body.id };
    const data = await Lokers.find(query);
    if (data[0].fileField.filename) {
      const blob = await remove(data[0].fileField.file);
      if (!blob.status == 200)
        res.json({
          code: 500,
          status: "SERVER_ERROR",
          errors: ["menghapus loker gagal !!!"],
        });
      else
        Lokers.deleteMany(query)
          .then((result) => {
            if (result.deletedCount > 0) {
              res.json({
                code: 200,
                status: "OK",
                mssg: "menghapus loker berhasil",
              });
            } else {
              res.json({
                code: 500,
                status: "SERVER_ERROR",
                errors: ["menghapus loker gagal !!!"],
              });
            }
          })
          .catch(() => {
            res.json({
              code: 500,
              status: "SERVER_ERROR",
              errors: ["menghapus loker gagal !!!"],
            });
          });
    } else {
      Lokers.deleteMany(query)
        .then((result) => {
          if (result.deletedCount > 0) {
            res.json({
              code: 200,
              status: "OK",
              mssg: "menghapus loker berhasil",
            });
          } else {
            res.json({
              code: 500,
              status: "SERVER_ERROR",
              errors: ["menghapus loker gagal !!!"],
            });
          }
        })
        .catch(() => {
          res.json({
            code: 500,
            status: "SERVER_ERROR",
            errors: ["menghapus loker gagal !!!"],
          });
        });
    }
  } catch (error) {
    res.json({
      code: 500,
      status: "SERVER_ERROR",
      errors: ["menghapus loker gagal !!!"],
    });
  }
};

export const applyLoker = async (req, res) => {
  try {
    const query1 = { _id: req.body.company_id };
    const query2 = { password: false, auth_token: false };
    const query3 = { _id: req.body.loker_id };
    const loker = await Lokers.find(query3);
    const isDuplicate = loker[0].applyeds.filter((apply) => {
      return apply.user_id == req.body.user_id;
    });
    if (loker[0].status == "open" && !isDuplicate.length) {
      const user = await User.find({_id: req.body.user_id})
      const company = await Company.find(query1, query2);
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: "gmail",
        secure: true,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      });
      if (req.files.cv) {
        if (req.files.plus1 && req.files.plus2 && req.files.plus3) {
          var mailOptions = {
            from: `${req.body.fullname} <no-reply@gmail.com>`,
            to: company[0].email,
            subject: `${req.body.loker_position}`,
            html: `
                    <div
                      class="container"
                      style="
                        display: flex;
                        justify-content: center;
                        padding: 5px 5%;
                        background: #eaeaea;
                      "
                    >
                      <div
                        class="con"
                        style="max-width: 580px; padding: 30px; background: #ffff"
                      >
                        <div class="head" style="padding-top: 5px">
                          <img
                            src="https://lokerklu.info/Logo1.png"
                            alt="icon"
                            style="max-width: 150px"
                          />
                        </div>
                        <div class="body" style="padding-left: 10px; margin-top: 35px">
                          <div>
                            <p style="line-height: normal">${req.body.bodyEmail}</p>
                          </div>
                          <hr />
                          <p>
                            Jika perusahaan anda tertarik dan pelamar ini sesuai dengan kriteria
                            dari perusahaan anda, silahkan menghubungi pelamar dengan menekan
                            tombol Hubungi Pelamar dibawah ini :
                          </p>
                          <button>
                            <a
                              style="text-decoration:none;"
                              href="https://lokerklu.info/companies/messages/${req.body.company_id}${req.body.user_id}"
                            >
                              <img
                                style="width:20px;"
                                src="https://lokerklu.info/chat.png"
                                alt="msg-icon"
                              />
                              Hubungi Pelamar
                            </a>
                          </button>
                        </div>
                      </div>
                    </div>
                  `,
            attachments: [
              {
                filename: req.files.cv[0].originalname,
                content: req.files.cv[0].buffer,
              },
              {
                filename: req.files.plus1[0].originalname,
                content: req.files.plus1[0].buffer,
              },
              {
                filename: req.files.plus2[0].originalname,
                content: req.files.plus2[0].buffer,
              },
              {
                filename: req.files.plus3[0].originalname,
                content: req.files.plus3[0].buffer,
              },
            ],
          };
        } else if (req.files.plus1 && req.files.plus2) {
          var mailOptions = {
            from: `${req.body.fullname} <no-reply@gmail.com>`,
            to: company[0].email,
            subject: `${req.body.loker_position}`,
            html: `
                     <div
                      class="container"
                      style="
                        display: flex;
                        justify-content: center;
                        padding: 5px 5%;
                        background: #eaeaea;
                      "
                    >
                      <div
                        class="con"
                        style="max-width: 580px; padding: 30px; background: #ffff"
                      >
                        <div class="head" style="padding-top: 5px">
                          <img
                            src="https://lokerklu.info/Logo1.png"
                            alt="icon"
                            style="max-width: 150px"
                          />
                        </div>
                        <div class="body" style="padding-left: 10px; margin-top: 35px">
                          <div>
                            <p style="line-height: normal">${req.body.bodyEmail}</p>
                          </div>
                          <hr />
                          <p>
                            Jika perusahaan anda tertarik dan pelamar ini sesuai dengan kriteria
                            dari perusahaan anda, silahkan menghubungi pelamar dengan menekan
                            tombol Hubungi Pelamar dibawah ini :
                          </p>
                          <button>
                            <a
                              style="text-decoration:none;"
                              href="https://lokerklu.info/companies/messages/${req.body.company_id}${req.body.user_id}"
                            >
                              <img
                                style="width:20px;"
                                src="https://lokerklu.info/chat.png"
                                alt="msg-icon"
                              />
                              Hubungi Pelamar
                            </a>
                          </button>
                        </div>
                      </div>
                    </div>
                  `,
            attachments: [
              {
                filename: req.files.cv[0].originalname,
                content: req.files.cv[0].buffer,
              },
              {
                filename: req.files.plus1[0].originalname,
                content: req.files.plus1[0].buffer,
              },
              {
                filename: req.files.plus2[0].originalname,
                content: req.files.plus2[0].buffer,
              },
            ],
          };
        } else if (req.files.plus1) {
          var mailOptions = {
            from: `${req.body.fullname} <no-reply@gmail.com>`,
            to: company[0].email,
            subject: `${req.body.loker_position}`,
            html: `
                     <div
                      class="container"
                      style="
                        display: flex;
                        justify-content: center;
                        padding: 5px 5%;
                        background: #eaeaea;
                      "
                    >
                      <div
                        class="con"
                        style="max-width: 580px; padding: 30px; background: #ffff"
                      >
                        <div class="head" style="padding-top: 5px">
                          <img
                            src="https://lokerklu.info/Logo1.png"
                            alt="icon"
                            style="max-width: 150px"
                          />
                        </div>
                        <div class="body" style="padding-left: 10px; margin-top: 35px">
                          <div>
                            <p style="line-height: normal">${req.body.bodyEmail}</p>
                          </div>
                          <hr />
                          <p>
                            Jika perusahaan anda tertarik dan pelamar ini sesuai dengan kriteria
                            dari perusahaan anda, silahkan menghubungi pelamar dengan menekan
                            tombol Hubungi Pelamar dibawah ini :
                          </p>
                          <button>
                            <a
                              style="text-decoration:none;"
                              href="https://lokerklu.info/companies/messages/${req.body.company_id}${req.body.user_id}"
                            >
                              <img
                                style="width:20px;"
                                src="https://lokerklu.info/chat.png"
                                alt="msg-icon"
                              />
                              Hubungi Pelamar
                            </a>
                          </button>
                        </div>
                      </div>
                    </div>
                  `,
            attachments: [
              {
                filename: req.files.cv[0].originalname,
                content: req.files.cv[0].buffer,
              },
              {
                filename: req.files.plus1[0].originalname,
                content: req.files.plus1[0].buffer,
              },
            ],
          };
        } else {
          if (req.body.plus1 && req.body.plus2 && req.body.plus3) {
            const plus1 = await downloadfile(req.body.plus1);
            const plus2 = await downloadfile(req.body.plus2);
            const plus3 = await downloadfile(req.body.plus3);
            var mailOptions = {
              from: `${req.body.fullname} <no-reply@gmail.com>`,
              to: company[0].email,
              subject: `${req.body.loker_position}`,
              html: `
                      <div
                        class="container"
                        style="
                          display: flex;
                          justify-content: center;
                          padding: 5px 5%;
                          background: #eaeaea;
                        "
                      >
                        <div
                          class="con"
                          style="max-width: 580px; padding: 30px; background: #ffff"
                        >
                          <div class="head" style="padding-top: 5px">
                            <img
                              src="https://lokerklu.info/Logo1.png"
                              alt="icon"
                              style="max-width: 150px"
                            />
                          </div>
                          <div class="body" style="padding-left: 10px; margin-top: 35px">
                            <div>
                              <p style="line-height: normal">${req.body.bodyEmail}</p>
                            </div>
                            <hr />
                            <p>
                              Jika perusahaan anda tertarik dan pelamar ini sesuai dengan kriteria
                              dari perusahaan anda, silahkan menghubungi pelamar dengan menekan
                              tombol Hubungi Pelamar dibawah ini :
                            </p>
                            <button>
                              <a
                                style="text-decoration:none;"
                                href="https://lokerklu.info/companies/messages/${req.body.company_id}${req.body.user_id}"
                              >
                                <img
                                  style="width:20px;"
                                  src="https://lokerklu.info/chat.png"
                                  alt="msg-icon"
                                />
                                Hubungi Pelamar
                              </a>
                            </button>
                          </div>
                        </div>
                      </div>
                    `,
              attachments: [
                {
                  filename: req.files.cv[0].originalname,
                  content: req.files.cv[0].buffer,
                },
                {
                  filename: req.body.plus1name,
                  content: plus1,
                },
                {
                  filename: req.body.plus2name,
                  content: plus2,
                },
                {
                  filename: req.body.plus3name,
                  content: plus3,
                },
              ],
            };
          }else if (req.body.plus1 && req.body.plus2) {
            const plus1 = await downloadfile(req.body.plus1);
            const plus2 = await downloadfile(req.body.plus2);
            var mailOptions = {
              from: `${req.body.fullname} <no-reply@gmail.com>`,
              to: company[0].email,
              subject: `${req.body.loker_position}`,
              html: `
                        <div
                          class="container"
                          style="
                            display: flex;
                            justify-content: center;
                            padding: 5px 5%;
                            background: #eaeaea;
                          "
                        >
                          <div
                            class="con"
                            style="max-width: 580px; padding: 30px; background: #ffff"
                          >
                            <div class="head" style="padding-top: 5px">
                              <img
                                src="https://lokerklu.info/Logo1.png"
                                alt="icon"
                                style="max-width: 150px"
                              />
                            </div>
                            <div class="body" style="padding-left: 10px; margin-top: 35px">
                              <div>
                                <p style="line-height: normal">${req.body.bodyEmail}</p>
                              </div>
                              <hr />
                              <p>
                                Jika perusahaan anda tertarik dan pelamar ini sesuai dengan kriteria
                                dari perusahaan anda, silahkan menghubungi pelamar dengan menekan
                                tombol Hubungi Pelamar dibawah ini :
                              </p>
                               <button>
                                <a
                                  style="text-decoration:none;"
                                  href="https://lokerklu.info/companies/messages/${req.body.company_id}${req.body.user_id}"
                                >
                                  <img
                                    style="width:20px;"
                                    src="https://lokerklu.info/chat.png"
                                    alt="msg-icon"
                                  />
                                  Hubungi Pelamar
                                </a>
                              </button>
                            </div>
                          </div>
                        </div>
                    `,
              attachments: [
                {
                  filename: req.files.cv[0].originalname,
                  content: req.files.cv[0].buffer,
                },
                {
                  filename: req.body.plus1name,
                  content: plus1,
                },
                {
                  filename: req.body.plus2name,
                  content: plus2,
                },
              ],
            };
          }else if (req.body.plus1) {
            const plus1 = await downloadfile(req.body.plus1);
            var mailOptions = {
              from: `${req.body.fullname} <no-reply@gmail.com>`,
              to: company[0].email,
              subject: `${req.body.loker_position}`,
              html: `
                       <div
                        class="container"
                        style="
                          display: flex;
                          justify-content: center;
                          padding: 5px 5%;
                          background: #eaeaea;
                        "
                      >
                        <div
                          class="con"
                          style="max-width: 580px; padding: 30px; background: #ffff"
                        >
                          <div class="head" style="padding-top: 5px">
                            <img
                              src="https://lokerklu.info/Logo1.png"
                              alt="icon"
                              style="max-width: 150px"
                            />
                          </div>
                          <div class="body" style="padding-left: 10px; margin-top: 35px">
                            <div>
                              <p style="line-height: normal">${req.body.bodyEmail}</p>
                            </div>
                            <hr />
                            <p>
                              Jika perusahaan anda tertarik dan pelamar ini sesuai dengan kriteria
                              dari perusahaan anda, silahkan menghubungi pelamar dengan menekan
                              tombol Hubungi Pelamar dibawah ini :
                            </p>
                            <button>
                              <a
                                style="text-decoration:none;"
                                href="https://lokerklu.info/companies/messages/${req.body.company_id}${req.body.user_id}"
                              >
                                <img
                                  style="width:20px;"
                                  src="https://lokerklu.info/chat.png"
                                  alt="msg-icon"
                                />
                                Hubungi Pelamar
                              </a>
                            </button>
                          </div>
                        </div>
                      </div>
                  `,
              attachments: [
                {
                  filename: req.files.cv[0].originalname,
                  content: req.files.cv[0].buffer,
                },
                {
                  filename: req.body.plus1name,
                  content: plus1,
                },
              ],
            };
          } else {
            var mailOptions = {
              from: `${req.body.fullname} <no-reply@gmail.com>`,
              to: company[0].email,
              subject: `${req.body.loker_position}`,
              html: `
                       <div
                        class="container"
                        style="
                          display: flex;
                          justify-content: center;
                          padding: 5px 5%;
                          background: #eaeaea;
                        "
                      >
                        <div
                          class="con"
                          style="max-width: 580px; padding: 30px; background: #ffff"
                        >
                          <div class="head" style="padding-top: 5px">
                            <img
                              src="https://lokerklu.info/Logo1.png"
                              alt="icon"
                              style="max-width: 150px"
                            />
                          </div>
                          <div class="body" style="padding-left: 10px; margin-top: 35px">
                            <div>
                              <p style="line-height: normal">${req.body.bodyEmail}</p>
                            </div>
                            <hr />
                            <p>
                              Jika perusahaan anda tertarik dan pelamar ini sesuai dengan kriteria
                              dari perusahaan anda, silahkan menghubungi pelamar dengan menekan
                              tombol Hubungi Pelamar dibawah ini :
                            </p>
                            <button>
                              <a
                                style="text-decoration:none;"
                                href="https://lokerklu.info/companies/messages/${req.body.company_id}${req.body.user_id}"
                              >
                                <img
                                  style="width:20px;"
                                  src="https://lokerklu.info/chat.png"
                                  alt="msg-icon"
                                />
                                Hubungi Pelamar
                              </a>
                            </button>
                          </div>
                        </div>
                      </div>
                  `,
              attachments: [
                {
                  filename: req.files.cv[0].originalname,
                  content: req.files.cv[0].buffer,
                },
              ],
            };
          }
        }
      } else {
        if (req.body.plus1 && req.body.plus2 && req.body.plus3) {
          const cv = await downloadfile(req.body.cv);
          const plus1 = await downloadfile(req.body.plus1);
          const plus2 = await downloadfile(req.body.plus2);
          const plus3 = await downloadfile(req.body.plus3);
          var mailOptions = {
            from: `${req.body.fullname} <no-reply@gmail.com>`,
            to: company[0].email,
            subject: `${req.body.loker_position}`,
            html: `
                     <div
                        class="container"
                        style="
                          display: flex;
                          justify-content: center;
                          padding: 5px 5%;
                          background: #eaeaea;
                        "
                      >
                        <div
                          class="con"
                          style="max-width: 580px; padding: 30px; background: #ffff"
                        >
                          <div class="head" style="padding-top: 5px">
                            <img
                              src="https://lokerklu.info/Logo1.png"
                              alt="icon"
                              style="max-width: 150px"
                            />
                          </div>
                          <div class="body" style="padding-left: 10px; margin-top: 35px">
                            <div>
                              <p style="line-height: normal">${req.body.bodyEmail}</p>
                            </div>
                            <hr />
                            <p>
                              Jika perusahaan anda tertarik dan pelamar ini sesuai dengan kriteria
                              dari perusahaan anda, silahkan menghubungi pelamar dengan menekan
                              tombol Hubungi Pelamar dibawah ini :
                            </p>
                            <button>
                              <a
                                style="text-decoration:none;"
                                href="https://lokerklu.info/companies/messages/${req.body.company_id}${req.body.user_id}"
                              >
                                <img
                                  style="width:20px;"
                                  src="https://lokerklu.info/chat.png"
                                  alt="msg-icon"
                                />
                                Hubungi Pelamar
                              </a>
                            </button>
                          </div>
                        </div>
                    </div>
                `,
            attachments: [
              {
                filename: req.body.cvname,
                content: cv,
              },
              {
                filename: req.body.plus1name,
                content: plus1,
              },
              {
                filename: req.body.plus2name,
                content: plus2,
              },
              {
                filename: req.body.plus3name,
                content: plus3,
              },
            ],
          };
        } else if (req.body.plus1 && req.body.plus2) {
          const cv = await downloadfile(req.body.cv);
          const plus1 = await downloadfile(req.body.plus1);
          const plus2 = await downloadfile(req.body.plus2);
          var mailOptions = {
            from: `${req.body.fullname} <no-reply@gmail.com>`,
            to: company[0].email,
            subject: `${req.body.loker_position}`,
            html: `
                    <div
                      class="container"
                      style="
                        display: flex;
                        justify-content: center;
                        padding: 5px 5%;
                        background: #eaeaea;
                      "
                    >
                      <div
                        class="con"
                        style="max-width: 580px; padding: 30px; background: #ffff"
                      >
                        <div class="head" style="padding-top: 5px">
                          <img
                            src="https://lokerklu.info/Logo1.png"
                            alt="icon"
                            style="max-width: 150px"
                          />
                        </div>
                        <div class="body" style="padding-left: 10px; margin-top: 35px">
                          <div>
                            <p style="line-height: normal">${req.body.bodyEmail}</p>
                          </div>
                          <hr />
                          <p>
                            Jika perusahaan anda tertarik dan pelamar ini sesuai dengan kriteria
                            dari perusahaan anda, silahkan menghubungi pelamar dengan menekan
                            tombol Hubungi Pelamar dibawah ini :
                          </p>
                          <button>
                            <a
                              style="text-decoration:none;"
                              href="https://lokerklu.info/companies/messages/${req.body.company_id}${req.body.user_id}"
                            >
                              <img
                                style="width:20px;"
                                src="https://lokerklu.info/chat.png"
                                alt="msg-icon"
                              />
                              Hubungi Pelamar
                            </a>
                          </button>
                        </div>
                      </div>
                    </div>
                  `,
            attachments: [
              {
                filename: req.body.cvname,
                content: cv,
              },
              {
                filename: req.body.plus1name,
                content: plus1,
              },
              {
                filename: req.body.plus2name,
                content: plus2,
              },
            ],
          };
        } else if (req.body.plus1) {
          const cv = await downloadfile(req.body.cv);
          const plus1 = await downloadfile(req.body.plus1);
          var mailOptions = {
            from: `${req.body.fullname} <no-reply@gmail.com>`,
            to: company[0].email,
            subject: `${req.body.loker_position}`,
            html: `
                    <div
                      class="container"
                      style="
                        display: flex;
                        justify-content: center;
                        padding: 5px 5%;
                        background: #eaeaea;
                      "
                    >
                      <div
                        class="con"
                        style="max-width: 580px; padding: 30px; background: #ffff"
                      >
                        <div class="head" style="padding-top: 5px">
                          <img
                            src="https://lokerklu.info/Logo1.png"
                            alt="icon"
                            style="max-width: 150px"
                          />
                        </div>
                        <div class="body" style="padding-left: 10px; margin-top: 35px">
                          <div>
                            <p style="line-height: normal">${req.body.bodyEmail}</p>
                          </div>
                          <hr />
                          <p>
                            Jika perusahaan anda tertarik dan pelamar ini sesuai dengan kriteria
                            dari perusahaan anda, silahkan menghubungi pelamar dengan menekan
                            tombol Hubungi Pelamar dibawah ini :
                          </p>
                          <button>
                            <a
                              style="text-decoration:none;"
                              href="https://lokerklu.info/companies/messages/${req.body.company_id}${req.body.user_id}"
                            >
                              <img
                                style="width:20px;"
                                src="https://lokerklu.info/chat.png"
                                alt="msg-icon"
                              />
                              Hubungi Pelamar
                            </a>
                          </button>
                        </div>
                      </div>
                    </div>
                  `,
            attachments: [
              {
                filename: req.body.cvname,
                content: cv,
              },
              {
                filename: req.body.plus1name,
                content: plus1,
              },
            ],
          };
        } else {
          if (req.files.plus1 && req.files.plus2 && req.files.plus3) {
            const cv = await downloadfile(req.body.cv);
            var mailOptions = {
              from: `${req.body.fullname} <no-reply@gmail.com>`,
              to: company[0].email,
              subject: `${req.body.loker_position}`,
              html: `
                      <div
                        class="container"
                        style="
                          display: flex;
                          justify-content: center;
                          padding: 5px 5%;
                          background: #eaeaea;
                        "
                      >
                        <div
                          class="con"
                          style="max-width: 580px; padding: 30px; background: #ffff"
                        >
                          <div class="head" style="padding-top: 5px">
                            <img
                              src="https://lokerklu.info/Logo1.png"
                              alt="icon"
                              style="max-width: 150px"
                            />
                          </div>
                          <div class="body" style="padding-left: 10px; margin-top: 35px">
                            <div>
                              <p style="line-height: normal">${req.body.bodyEmail}</p>
                            </div>
                            <hr />
                            <p>
                              Jika perusahaan anda tertarik dan pelamar ini sesuai dengan kriteria
                              dari perusahaan anda, silahkan menghubungi pelamar dengan menekan
                              tombol Hubungi Pelamar dibawah ini :
                            </p>
                            <button>
                            <a
                              style="text-decoration:none;"
                              href="https://lokerklu.info/companies/messages/${req.body.company_id}${req.body.user_id}"
                            >
                              <img
                                style="width:20px;"
                                src="https://lokerklu.info/chat.png"
                                alt="msg-icon"
                              />
                              Hubungi Pelamar
                            </a>
                          </button>
                          </div>
                        </div>
                      </div>
                  `,
              attachments: [
                {
                  filename: req.body.cvname,
                  content: cv,
                },
                {
                  filename: req.files.plus1[0].originalname,
                  content: req.files.plus1[0].buffer,
                },
                {
                  filename: req.files.plus2[0].originalname,
                  content: req.files.plus2[0].buffer,
                },
                {
                  filename: req.files.plus3[0].originalname,
                  content: req.files.plus3[0].buffer,
                },
              ],
            };
          } else if (req.files.plus1 && req.files.plus2) {
            const cv = await downloadfile(req.body.cv);
            var mailOptions = {
              from: `${req.body.fullname} <no-reply@gmail.com>`,
              to: company[0].email,
              subject: `${req.body.loker_position}`,
              html: `
                      <div
                        class="container"
                        style="
                          display: flex;
                          justify-content: center;
                          padding: 5px 5%;
                          background: #eaeaea;
                        "
                      >
                        <div
                          class="con"
                          style="max-width: 580px; padding: 30px; background: #ffff"
                        >
                          <div class="head" style="padding-top: 5px">
                            <img
                              src="https://lokerklu.info/Logo1.png"
                              alt="icon"
                              style="max-width: 150px"
                            />
                          </div>
                          <div class="body" style="padding-left: 10px; margin-top: 35px">
                            <div>
                              <p style="line-height: normal">${req.body.bodyEmail}</p>
                            </div>
                            <hr />
                            <p>
                              Jika perusahaan anda tertarik dan pelamar ini sesuai dengan kriteria
                              dari perusahaan anda, silahkan menghubungi pelamar dengan menekan
                              tombol Hubungi Pelamar dibawah ini :
                            </p>
                            <button>
                              <a
                                style="text-decoration:none;"
                                href="https://lokerklu.info/companies/messages/${req.body.company_id}${req.body.user_id}"
                              >
                                <img
                                  style="width:20px;"
                                  src="https://lokerklu.info/chat.png"
                                  alt="msg-icon"
                                />
                                Hubungi Pelamar
                              </a>
                            </button>
                          </div>
                        </div>
                      </div>
                  `,
              attachments: [
                {
                  filename: req.body.cvname,
                  content: cv,
                },
                {
                  filename: req.files.plus1[0].originalname,
                  content: req.files.plus1[0].buffer,
                },
                {
                  filename: req.files.plus2[0].originalname,
                  content: req.files.plus2[0].buffer,
                },
              ],
            };
          } else if(req.files.plus1) {
            const cv = await downloadfile(req.body.cv);
            var mailOptions = {
              from: `${req.body.fullname} <no-reply@gmail.com>`,
              to: company[0].email,
              subject: `${req.body.loker_position}`,
              html: `
                      <div
                        class="container"
                        style="
                          display: flex;
                          justify-content: center;
                          padding: 5px 5%;
                          background: #eaeaea;
                        "
                      >
                        <div
                          class="con"
                          style="max-width: 580px; padding: 30px; background: #ffff"
                        >
                          <div class="head" style="padding-top: 5px">
                            <img
                              src="https://lokerklu.info/Logo1.png"
                              alt="icon"
                              style="max-width: 150px"
                            />
                          </div>
                          <div class="body" style="padding-left: 10px; margin-top: 35px">
                            <div>
                              <p style="line-height: normal">${req.body.bodyEmail}</p>
                            </div>
                            <hr />
                            <p>
                              Jika perusahaan anda tertarik dan pelamar ini sesuai dengan kriteria
                              dari perusahaan anda, silahkan menghubungi pelamar dengan menekan
                              tombol Hubungi Pelamar dibawah ini :
                            </p>
                            <button>
                              <a
                                style="text-decoration:none;"
                                href="https://lokerklu.info/companies/messages/${req.body.company_id}${req.body.user_id}"
                              >
                                <img
                                  style="width:20px;"
                                  src="https://lokerklu.info/chat.png"
                                  alt="msg-icon"
                                />
                                Hubungi Pelamar
                              </a>
                            </button>
                          </div>
                        </div>
                      </div>
                  `,
              attachments: [
                {
                  filename: req.body.cvname,
                  content: cv,
                },
                {
                  filename: req.files.plus1[0].originalname,
                  content: req.files.plus1[0].buffer,
                },
              ],
            };
          } else {
            const cv = await downloadfile(req.body.cv);
            var mailOptions = {
              from: `${req.body.fullname} <no-reply@gmail.com>`,
              to: company[0].email,
              subject: `${req.body.loker_position}`,
              html: `
                      <div
                        class="container"
                        style="
                          display: flex;
                          justify-content: center;
                          padding: 5px 5%;
                          background: #eaeaea;
                        "
                      >
                        <div
                          class="con"
                          style="max-width: 580px; padding: 30px; background: #ffff"
                        >
                          <div class="head" style="padding-top: 5px">
                            <img
                              src="https://lokerklu.info/Logo1.png"
                              alt="icon"
                              style="max-width: 150px"
                            />
                          </div>
                          <div class="body" style="padding-left: 10px; margin-top: 35px">
                            <div>
                              <p style="line-height: normal">${req.body.bodyEmail}</p>
                            </div>
                            <hr />
                            <p>
                              Jika perusahaan anda tertarik dan pelamar ini sesuai dengan kriteria
                              dari perusahaan anda, silahkan menghubungi pelamar dengan menekan
                              tombol Hubungi Pelamar dibawah ini :
                            </p>
                            <button>
                              <a
                                style="text-decoration:none;"
                                href="https://lokerklu.info/companies/messages/${req.body.company_id}${req.body.user_id}"
                              >
                                <img
                                  style="width:20px;"
                                  src="https://lokerklu.info/chat.png"
                                  alt="msg-icon"
                                />
                                Hubungi Pelamar
                              </a>
                            </button>
                          </div>
                        </div>
                      </div>
                  `,
              attachments: [
                {
                  filename: req.body.cvname,
                  content: cv,
                },
              ],
            };
          }
        }
      }
      transporter.sendMail(mailOptions, async function (err) {
        if (err) {
          res.json({
            code: 500,
            status: "SERVER_ERROR",
            error: ["email pengajuan lamaran gagal terkirim."],
          });
        } else {
          let file = [];
          let dataCV = {}
          if (req.files.cv || req.files.plus1) {
            let addresUser = {
                  jalan: req.body.jalan,
                  kec: req.body.kec,
                  kabkota: req.body.kabkota,
            };
            const fileURL = await store(req.files.cv[0]); 
            dataCV = {
                filename: req.files.cv[0].originalname,
                file: fileURL.url,
                downloadURL: fileURL.downloadUrl,
                time: new Date().getTime(),
                size: req.files.cv[0].size,
            };
            if (req.files.plus1 && req.files.plus2 && req.files.plus3) {
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
            }else if (req.files.plus1 && req.files.plus2) {
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
            }else if (req.files.plus1) {
                let add1 = await store(req.files.plus1[0]);
                file.push({
                  filename: req.files.plus1[0].originalname,
                  downloadURL: add1.downloadUrl,
                  file: add1.url,
                });
            }
            const query1 = { _id: req.body.user_id };
            const query2 = { $set: {study: req.body.study, addres: addresUser, cv: dataCV, plus: file} };
            await User.updateMany(query1, query2);
          }else {
            let query = {_id: req.body.user_id}
            let user = await User.find(query)
            dataCV = user[0].cv
            file = user[0].plus
          }
          const query = { room_key:  req.body.company_id + req.body.user_id};
          let isDuplicate = await Message.find(query);
          if (isDuplicate.length == 0) {
            let users = [{user_id: req.body.user_id.toString(),fullname: req.body.fullname,available: true}, {user_id: company[0]._id.toString(),companyName: company[0].companyName,company_images: company[0].company_images[0],available: true}];
            let data = {
              key: {
                userPubl: user[0].key.public,
                compPubl: company[0].key.public
              },
              room_key:  req.body.company_id + req.body.user_id,
              users: users,
            };
            let insert = await Message.insertMany(data)
            if (insert.length) {
              const _id = {_id: genCode(24)}
              const e2eKey = ((company[0].key.public ** user[0].key.private) % process.env.M).toString()
              const bodyEmail = req.body.bodyEmail.replaceAll("<br></br>","\n")
              const explText = cryptoJS.AES.encrypt(bodyEmail, e2eKey).toString();
              const chat = {
                  read: [],
                  to: company[0]._id,
                  fromUser: req.body.fullname,
                  from: req.body.user_id,
                  toUser: company[0].companyName,
                  text: explText,
                  files: [dataCV,...file],
                  created_at: new Date(),
                  update_at: new Date(),
              }
              const dataTemp = {..._id,...chat}
              const query2 = { $push: { messages: dataTemp } };
              await Message.updateMany(query, query2);
            }
          }else {
            if (isDuplicate[0].users.find(user => {return user.available == false})) {
              const query2 = { $set: {"users.$[filt].available" : true  } };
              const query3 = {arrayFilters: [{"filt.user_id": isDuplicate[0].users[0].user_id}]}
              await Message.updateMany(query,query2,query3)
            }
              const _id = {_id: genCode(24)}
              const e2eKey = ((company[0].key.public ** user[0].key.private) % process.env.M).toString()
              const bodyEmail = req.body.bodyEmail.replaceAll("<br></br>","\n")
              const explText = cryptoJS.AES.encrypt(bodyEmail, e2eKey).toString();
              const chat = {
                  read: [],
                  to: company[0]._id,
                  fromUser: req.body.fullname,
                  from: req.body.user_id,
                  toUser: company[0].companyName,
                  text: explText,
                  files: [dataCV,...file],
                  created_at: new Date(),
                  update_at: new Date(),
              }
              const dataTemp = {..._id,...chat}
              const query2 = { $push: { messages: dataTemp } };
              await Message.updateMany(query, query2); 
          }
          const applyed = {
            user_id: req.body.user_id,
            fullname: req.body.fullname,
            study: req.body.study,
            companie: req.body.companie,
            position: req.body.loker_position,
            addres: {
              jalan: req.body.jalan,
              kec: req.body.kec,
              kabkota: req.body.kabkota,
            },
            applyed_at: new Date(),
          };
          let query1 = { _id: req.body.loker_id };
          let query2 = { $push: { applyeds: applyed } }; 
          await Lokers.updateMany(query1, query2)
            .then(async (result) => {
              if (result.modifiedCount > 0) {
                res.json({
                  code: 200,
                  status: "OK",
                  mssg: `
                                  proses pengajuan lamaran kerja kepada pihak perusahaan telah berhasil,
                                  untuk peroses lebih lanjut menjadi tanggung jawab anda dan pihak perusahaan. 
                              `,
                });
              } else {
                res.json({
                  code: 500,
                  status: "SERVER_ERROR",
                  errors: ["data pengajuan lamaran gagal diinput !!!"],
                });
              }
            })
            .catch((err) => {
              res.json({
                code: 500,
                status: "SERVER_ERROR",
                errors: ["data pengajuan lamaran gagal diinput !!!"],
              });
            });
        }
      });
    } else {
      res.json({
        code: 500,
        status: "SERVER_ERROR",
        errors: [
          "anda sudah melamar untuk posisi ini atau pengajuan lamaran gagal !!!",
        ],
      });
    }
  } catch (error) {
    res.json({
      code: 500,
      status: "SERVER_ERROR",
      errors: ["pengajuan lamaran gagal !!!"],
    });
  }
};

export const searchLokers = (req, res) => {
  try {
    const queryParams = function () {
      if (req.body.type) {
        return { type: { $regex: new RegExp(req.body.type,'i') } };
      } else if (req.body.work_time) {
        return { work_time: { $regex: new RegExp(req.body.work_time,'i') } };
      } else if (req.body.bidang) {
        return { industry_type: { $regex: new RegExp(req.body.bidang,'i') } };
      } else {
        return { "addres.kec": { $regex: new RegExp(req.body.location,'i') } };
      }
    };
    Lokers.find(queryParams())
      .then(async (result) => {
        if (result.length) {
          let lokers = [];
          var querys = [];
          if (req.body.type) {
            querys.push({ value: req.body.type });
          }
          if (req.body.work_time) {
            querys.push({ value: req.body.work_time });
          }
          if (req.body.bidang) {
            querys.push({ value: req.body.bidang });
          }
          if (req.body.location) {
            querys.push({ value: req.body.location });
          }
          for (const query of querys) {
            lokers = result.filter((data) => {
              return (
                data.type.toLowerCase() == query.value.toLowerCase() ||
                data.work_time.toLowerCase() == query.value.toLowerCase() ||
                data.industry_type.toLowerCase() == query.value.toLowerCase() ||
                data.addres.kec.toLowerCase() == query.value.toLowerCase()
              );
            });
          }
          res.json({
            code: 200,
            status: "OK",
            lokers,
          });
        } else {
          res.json({
            code: 404,
            status: "NOT_FOUND",
            lokers: [],
            errors: ["data tidak ditemukan"],
          });
        }
      })
      .catch((err) => {
        res.json({
          code: 404,
          status: "NOT_FOUND",
          lokers: [],
          errors: ["data tidak ditemukan"],
        });
      });
  } catch (error) {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      lokers: [],
      errors: ["data tidak ditemukan"],
    });
  }
};

export const getCompanyApplyed = (req, res) => {
  try {
    const query1 = {};
    Lokers.find(query1)
      .then((result) => {
        if (result.length) {
          let applyeds = [];
          result.map((result) => {
            if (result.applyeds.length) {
              result.applyeds.map(async (apply) => {
                applyeds.push(apply);
              });
            }
          });
          result.reverse()
          applyeds.reverse()
          res.json({
            code: 200,
            status: "OK",
            lokers: result,
            applyeds
          });
        } else {
          res.json({
            code: 404,
            status: "NOT_FOUND",
            errors: ["data tidak ditemukan"],
          });
        }
      })
      .catch(() => {
        res.json({
          code: 404,
          status: "NOT_FOUND",
          errors: ["data tidak ditemukan"],
        });
      });
  } catch (error) {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      errors: ["data tidak ditemukan"],
    });
  }
};

export const getLokersApplyed = async (req, res) => {
  try {
    const query1 = {applyeds: {$elemMatch:  {user_id: req.body._id}}}
    const applyed = await Lokers.find(query1)
    if (applyed.length) {
      res.json({
        code: 200,
        status: "OK",
        applyed
      });
    } else {
      res.json({
        code: 404,
        status: "NOT_FOUND",
        errors: ["data tidak ditemukan"],
      });
    }
  } catch (error) {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      errors: ["data tidak ditemukan"],
    });
  }
};

export const sharesLoker = async (req, res) => {
  try {
    if (req.body.media == "gmail") {
      let hasil = req.body.to.map(async (to) => {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          secure: true,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
          },
        });
        var mailOptions = {
          from: `'lokerKLU' <no-reply@gmail.com>`,
          to: to,
          subject: req.body.subjek,
          html: `
                        <body style="text-align:start;">
                        <header>
                            <img src=${req.body.thumbnile_url} style="height:300px;min-width:360px;border-radius:5px;"/>
                        </header>
                        <section>
                            ${req.body.describe}
                        </section>
                        <section>
                            <h4>Untuk detail loker silahkan check di link : <a href=${req.body.link_loker}>${req.body.link_loker}</a></h4>
                        </section>
                        </body>
                    `,
        };
        const result = await transporter.sendMail(mailOptions);
        if (result.response.includes("OK")) {
          return "OK";
        } else {
          return "NO";
        }
      });
      for (const has of hasil) {
        has.then((obj) => {
          if (obj == "OK") {
            res.json({
              code: 200,
              status: "OK",
              mssg: "shares to gmail success.",
            });
          } else {
            res.json({
              code: 500,
              status: "PROCESS_FAILED",
              errors: ["shares to gmail failed !!!."],
            });
          }
        });
        break;
      }
    }
    if (req.body.media == "instagram") {
      const ig = new IgApiClient();
      ig.state.generateDevice(req.body.IG_username);
      await ig.account.login(req.body.IG_username, req.body.IG_password);
      const imageBuffer = await get({
        url: req.body.thumbnile_url,
        encoding: null,
      });
      let result = ''
      const caption = req.body.describe;
      let link = req.body.link_loker
      if (req.body.igMethod == "Story") {
        const media = {
          file: imageBuffer,
          caption,
          stickerConfig: {
            link,
            linkType: 1,
            linkText: 'Lihat detail',
          },
        }
        result = await ig.publish.story(media);
      } else {
        const media = {
          file: imageBuffer,
          caption,
        };
        result = await ig.publish.photo(media);
      }
      if (result.status == "ok") {
        res.json({
          code: 200,
          status: "OK",
          mssg: "shares to instagram success.",
        });
      } else {
        res.json({
          code: 500,
          status: "PROCESS_FAILED",
          errors: ["shares to instagram failed !!!."],
        });
      }
    }
  } catch (error) {
    res.json({
      code: 500,
      status: "PROCESS_FAILED",
      errors: ["shares failed !!!."],
    });
  }
};

export const deleteApply = async (req,res) => {
  try {
    const query1 = {_id: req.body.apply_id}
    const query2 = {$pull: {applyeds : {user_id: req.body.user_id}}}
    let remove = await Lokers.updateMany(query1,query2)
    if (remove.modifiedCount > 0) {
      res.json({
        code: 200,
        status: "OK",
        mssg: "menghapus data lamaran berhasil."
      })
    } else {
      res.json({
        code: 500,
        status: "FAILED",
        errors: ["menghapus data lamaran gagal !!!."]
      })
    }
  } catch (error) {
    res.json({
      code: 500,
      status: "FAILED",
      errors: ["menghapus data lamaran gagal !!!."]
    })
  }
}
