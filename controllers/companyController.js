import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Lokers from "../models/Lokers.js";
import Company from "../models/Company.js";
import { store, remove } from "../utils/VercelBlob.js";
import {
  genCode,
  genToken,
  genPass,
  verifyPass,
  genFactoryToken,
  verifyJwtToken,
  generatePrimes,
  getPublic,
} from "../generate/genPass.js";

dotenv.config();

export const companyAuth = async (req, res) => {
  try {
    const isTokenvalid = verifyJwtToken(req.body.Token);
    if (isTokenvalid) {
      const query1 = { _id: isTokenvalid.id };
      const query2 = { auth_token: false };
      Company.find(query1, query2)
        .then(async (result) => {
          if (result.length) {
            let secureUser = verifyPass(
              result[0].password,
              isTokenvalid.password
            );
            if (secureUser) {
              result[0].password = "";
              res.json({
                code: 200,
                status: "OK",
                company: result,
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

export const changePassword = async (req, res) => {
  try {
    const query = { email: req.body.email };
    const company = await Company.find(query);
    if (company.length) {
      if (verifyPass(company[0].password, req.body.oldPassword)) {
        let newPassword = genPass(req.body.newPassword);
        const query1 = { _id: company[0]._id };
        const query2 = { password: newPassword };
        await Company.updateMany(query1, query2)
          .then((result) => {
            if (result.modifiedCount > 0) {
              const transporter = nodemailer.createTransport({
                service: "gmail",
                secure: true,
                auth: {
                  user: process.env.EMAIL,
                  pass: process.env.PASS,
                },
              });
              var mailOptions = {
                from: "'LokerKLU' <no-reply@gmail.com>",
                to: company[0].email,
                subject: "Perubahan Sandi",
                html: `
                                <div class="container" style="padding:50px 5%;background:#eaeaea;">
                                    <div class="con" style="max-width:580px;padding:0 30px;background:#ffff;">
                                        <div class="head" style="padding-top:25px;">
                                            <img src="https://lokerklu.info/Logo1.png" alt="icon" style="width:150px;">
                                        </div>
                                        <div class="body" style="padding-left:10px;margin-top:40px;">
                                            <p>kami sudah memverifikasi perubahan sandi dari perusahaan dengan nama ${company[0].companyName} : </p>
                                            <div style="line-height:normal">
                                                <p><strong>email : </strong>${company[0].email}</p>
                                                <p><strong>sandi baru : </strong>${req.body.newPassword}</p>
                                                <p><strong>waktu : </strong>${new Date().toDateString()}</p>
                                            </div>
                                            <div>
                                                <p>Anda menerima pesan ini karena berhasil merubah sandi akun ${company[0].email}. Jika Anda yakin proses perubahan ini mencurigakan, harap segera setel ulang kata sandi Anda.</p>
                                            </div>
                                            <div>
                                                <p>Jika Anda mengetahui proses perubahan ini, harap abaikan pemberitahuan ini. Hal ini dapat terjadi ketika Anda menggunakan mode penyamaran atau penjelajahan pribadi atau menghapus cookie Anda.</p>
                                            </div>
                                            <p>Terima kasih</p>
                                            <br>
                                            <p>LokerKLU Team</p>
                                            <div style="text-align:center;padding-top:20px;padding-bottom:10px;">
                                                <p style="color: #c7c7c7;">Pesan ini telah dikirim dari LokerKLU, Inc.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `,
              };
              transporter.sendMail(mailOptions, function (err) {
                if (err) {
                  res.json({
                    code: 500,
                    status: "SERVER_ERROR",
                    error: ["prosess ubah password gagal 6 !!!."],
                  });
                } else {
                  const token = genToken(company[0]._id, req.body.newPassword);
                  res.json({
                    code: 200,
                    status: "OK",
                    token: token,
                    mssg: "prosess ubah password berhasil.",
                  });
                }
              });
            } else {
              res.json({
                code: 500,
                status: "SERVER_ERROR",
                erros: ["prosess ubah password gagal 5 !!!."],
              });
            }
          })
          .catch((err) => {
            res.json({
              code: 500,
              status: "SERVER_ERROR",
              erros: ["prosess ubah password gagal 4 !!!."],
            });
          });
      } else {
        res.json({
          code: 500,
          status: "SERVER_ERROR",
          erros: ["prosess ubah password gagal 3 !!!."],
        });
      }
    } else {
      res.json({
        code: 500,
        status: "SERVER_ERROR",
        erros: ["prosess ubah password gagal 2 !!!."],
      });
    }
  } catch (error) {
    res.json({
      code: 500,
      status: "SERVER_ERROR",
      erros: ["prosess ubah password gagal 1 !!!."],
    });
  }
};

export const getCompanyById = (req, res) => {
  try {
    const query = { _id: req.body._id };
    Company.find(query)
      .then((result1) => {
        if (result1.length) {
          const query = { company_id: req.body._id };
          Lokers.find(query)
            .then((result2) => {
              if (result2.length) {
                res.json({
                  code: 200,
                  status: "OK",
                  lokers: result2.reverse(),
                  companies: result1,
                });
              } else {
                res.json({
                  code: 200,
                  status: "OK",
                  lokers: [],
                  companies: result1,
                });
              }
            })
            .catch(() => {
              res.json({
                code: 200,
                status: "OK",
                lokers: [],
                companies: result1,
              });
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

export const getCompanyByName = async (req, res) => {
  try {
    const query1 = { companyName: { $regex: new RegExp(req.body.keyword,'i') },activied: true};
    const query2 = { password: 0, auth_token: 0, activied: 0 };
    let companies = await Company.find(query1, query2);
    if (companies.length) {
      res.json({
        code: 200,
        status: "OK",
        companies: companies,
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

export const getRecomendCompanies = async (req, res) => {
  try {
    const query1 = { activied: true };
    const query2 = { password: 0, auth_token: 0, activied: 0 };
    let data = await Company.find(query1, query2).limit(5);
    let companiesId = [];
    for (let companie of data) {
      companiesId.push(companie._id.toString());
    }
    let lokers = await Lokers.find({ company_id: { $in: companiesId } });
    for (let companie of data) {
      let lokerCount = lokers.filter((data) => {
        return data.company_id == companie._id;
      }).length;
      companie.lokersCount = lokerCount;
    }
    res.json({
      code: 200,
      status: "OK",
      companies: data,
    });
  } catch (error) {
    res.json({
      code: 404,
      status: error,
      errors: ["data tida ditemukan !!!"],
    });
  }
};

export const companyRegistrate = async (req, res) => {
  const nomor = req.body.nomor.split("-");
  let fixNo = nomor[0].concat(nomor[1], nomor[2]);
  req.body.nomor = fixNo;
  const query = {
    $or: [{ companyName: req.body.companyName }, { email: req.body.email }],
  };
  let isDuplicate = await Company.find(query);
  if (isDuplicate.length) {
    res.json({
      code: 500,
      status: "DATA_DUPLICATE",
      errors: ["perusahaan dengan nama atau email ini sudah ada !!!"],
    });
  } else {
    try {
      let urls = [];
      if (req.files.file2) {
        if (req.files.file3) {
          if (req.files.file4) {
            var blob1 = await store(req.files.file1[0]);
            urls.push(blob1.url);
            var blob2 = await store(req.files.file2[0]);
            urls.push(blob2.url);
            var blob3 = await store(req.files.file3[0]);
            urls.push(blob3.url);
            var blob4 = await store(req.files.file4[0]);
            urls.push(blob4.url);
          } else {
            var blob1 = await store(req.files.file1[0]);
            urls.push(blob1.url);
            var blob2 = await store(req.files.file2[0]);
            urls.push(blob2.url);
            var blob3 = await store(req.files.file3[0]);
            urls.push(blob3.url);
          }
        } else {
          var blob1 = await store(req.files.file1[0]);
          urls.push(blob1.url);
          var blob2 = await store(req.files.file2[0]);
          urls.push(blob2.url);
        }
      } else {
        var blob = await store(req.files.file1[0]);
        urls.push(blob.url);
      }
      if (urls.length) {
        const priv = generatePrimes()
        const publ = getPublic(priv)
        req.body = {
          key: {
            private: priv, 
            public: publ 
          },
          owner: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
          },
          addres: {
            jalan: req.body.jalan,
            kec: req.body.kec,
            kabkota: req.body.kabkota,
          },
          companyName: req.body.companyName,
          nomor: req.body.nomor,
          email: req.body.email,
          company_images: urls,
          companyType: req.body.companyType,
        };
        Company.insertMany(req.body)
          .then((result) => {
            if (result.length) {
              const transporter = nodemailer.createTransport({
                service: "gmail",
                secure: true,
                auth: {
                  user: process.env.EMAIL,
                  pass: process.env.PASS,
                },
              });
              var mailOptions = {
                from: "'LokerKLU' <no-reply@gmail.com>",
                to: result[0].email,
                subject: "Proses Validasi Akun Perusahaan",
                html: `
                                <div class="container" style="padding:50px 5%;background:#eaeaea;">
                                    <div class="con" style="max-width:580px;padding:0 30px;background:#ffff;">
                                        <div class="head" style="padding-top:25px;">
                                            <img src="https://lokerklu.info/Logo1.png" alt="icon" style="width:150px;">
                                        </div>
                                        <div class="body" style="padding-left:10px;margin-top:40px;">
                                            <p>kami tengah melakukan validasi dari perusahaan dengan nama ${req.body.companyName} : </p>
                                            <div style="line-height:normal">
                                                <p><strong>email : </strong>${req.body.email}</p>
                                                <p><strong>nomor : </strong>${req.body.nomor}</p>
                                                <p><strong>tipe perusahaan : </strong>${req.body.companyType}</p>
                                                <p><strong>alamat : </strong>${req.body.addres.jalan},${req.body.addres.kec},${req.body.addres.kabkota}</p>
                                                <p><strong>waktu : </strong>${new Date().toDateString()}</p>
                                            </div>
                                            <div>
                                                <p>Anda menerima pesan ini karena berhasil melakukan registrasi akun ${req.body.companyName}. Proses validasi akun perusahaan ini memerlukan waktu maksimal hingga 24 jam.</p>
                                            </div>
                                            <div>
                                                <p>Jika proses validasi akun telah selesai, team kami akan mengirimi anda email berisi credential berupa email dan password untuk melakukan login ke akun perusahan anda.</p>
                                            </div>
                                            <p>Terima kasih</p>
                                            <br>
                                            <p>LokerKLU Team</p>
                                            <div style="text-align:center;padding-top:20px;padding-bottom:10px;">
                                                <p style="color: #c7c7c7;">Pesan ini telah dikirim dari LokerKLU, Inc.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `,
              };
              transporter.sendMail(mailOptions, function (err) {
                if (err) {
                  res.json({
                    code: 500,
                    status: "SERVER_ERROR",
                    error: [
                      "silahkan tunggu email konformasi dari admin kami.",
                    ],
                  });
                } else {
                  res.json({
                    code: 200,
                    status: "OK",
                    mssg: "Proses registrasi selesai,untuk proses selanjutnya silahkan cek email yang telah kami kirimkan.",
                  });
                }
              });
            } else {
              res.json({
                code: 500,
                status: "SERVER_ERROR",
                errors: ["internal server error"],
              });
            }
          })
          .catch(() => {
            res.json({
              code: 500,
              status: "SERVER_ERROR",
              errors: ["internal server error"],
            });
          });
      } else {
        res.json({
          code: 500,
          status: "SERVER_ERROR",
          errors: ["mengunggah dokumentasi perusahaan gagal !!!"],
        });
      }
    } catch (error) {
      res.json({
        code: 500,
        status: "SERVER_ERROR",
        errors: ["prosess registrasi akun gagal !!!."],
      });
    }
  }
};

export const companyLogin = (req, res) => {
  try {
    const query1 = { email: req.body.email,activied: true };
    const query2 = { auth_token: false };
    Company.find(query1, query2)
      .then((result1) => {
        if (result1.length) {
          const auth = verifyPass(result1[0].password, req.body.password);
          if (auth) {
            const token = genToken(result1[0]._id, req.body.password);
            const query1 = { _id: result1[0]._id };
            const query2 = { auth_token: token };
            Company.updateMany(query1, query2)
              .then(async (result2) => {
                if (result2.modifiedCount > 0) {
                  const company = { ...result1[0], ...{ auth_token: token } };
                  res.json({
                    code: 200,
                    status: "OK",
                    mssg: "login akun perusahaan berhasil",
                    company,
                  });
                } else {
                  res.json({
                    code: 401,
                    status: "NO_AUTHENTICATION",
                    errors: ["akun tidak terauthentication !!!."],
                  });
                }
              })
              .catch(() => {
                res.json({
                  code: 401,
                  status: "NO_AUTHENTICATION",
                  errors: ["akun tidak terauthentication !!!."],
                });
              });
          } else {
            res.json({
              code: 404,
              status: "NOT_FOUND",
              errors: ["email atau password tidak valid"],
            });
          }
        } else {
          res.json({
            code: 404,
            status: "NOT_FOUND",
            errors: ["email atau password tidak valid"],
          });
        }
      })
      .catch(() => {
        res.json({
          code: 404,
          status: "NOT_FOUND",
          errors: ["email atau password tidak valid"],
        });
      });
  } catch (error) {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      errors: ["email atau password tidak valid"],
    });
  }
};

export const getCompanyReq = (req, res) => {
  try {
    const query1 = { $or: [{ activied: false }, { password: "" }] };
    const query2 = { password: false, auth_token: false };
    Company.find(query1, query2).then((result) => {
      if (result.length) {
        res.json({
          code: 200,
          status: "OK",
          request: result,
        });
      } else {
        res.json({
          code: 404,
          status: "NOT_FOUND",
          errors: ["tidak ada data yang di kembalikan !!!"],
        });
      }
    });
  } catch (error) {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      errors: ["tidak ada data yang di kembalikan !!!"],
    });
  }
};

export const getCompanyVerify = (req, res) => {
  try {
    const query1 = { activied: true };
    const query2 = { password: false, auth_token: false };
    Company.find(query1, query2).then((result) => {
      if (result.length) {
        res.json({
          code: 200,
          status: "OK",
          verified: result,
        });
      } else {
        res.json({
          code: 404,
          status: "NOT_FOUND",
          errors: ["tidak ada data yang di kembalikan !!!"],
        });
      }
    });
  } catch (error) {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      errors: ["tidak ada data yang di kembalikan !!!"],
    });
  }
};

export const activiedAkun = (req, res) => {
  try {
    const query1 = { _id: req.body._id };
    const query2 = { auth_token: false, password: false };
    Company.find(query1, query2)
      .then((result1) => {
        if (result1.length) {
          const password = genCode(7);
          const hashPass = genPass(password);
          const query1 = { _id: result1[0]._id };
          const query2 = { password: hashPass, activied: true };
          Company.updateMany(query1, query2)
            .then((result2) => {
              if (result2.modifiedCount > 0) {
                const transporter = nodemailer.createTransport({
                  service: "gmail",
                  secure: true,
                  auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASS,
                  },
                });
                var mailOptions = {
                  from: "'LokerKLU' <no-reply@gmail.com>",
                  to: result1[0].email,
                  subject: "Validated Akun Perusahaan",
                  html: `  
                               <div class="container" style="padding:50px 5%;background:#eaeaea;">
                                    <div class="con" style="max-width:580px;padding:0 30px;background:#ffff;">
                                        <div class="head" style="padding-top:25px;">
                                            <img src="https://lokerklu.info/Logo1.png" alt="icon" style="width:150px;">
                                        </div>
                                        <div class="body" style="padding-left:10px;margin-top:40px;">
                                            <p>Perusahaan anda telah divalidasi, silahkan login ke akun perusahaan anda menggunakan cridential di bawah ini :</p>
                                            <div style="line-height:normal;">
                                                <p> <strong>email:</strong> ${result1[0].email} </p>
                                                <p> <strong>password:</strong> ${password} </p>
                                            </div>
                                            <div>
                                                <p>Anda menerima pesan ini karena berhasil melakukan registrasi akun ${result1[0].companyName}. Proses validasi akun perusahaan ini telah selesai.</p>
                                            </div>
                                            <div>
                                                <p>Proses validasi akun telah selesai, team kami telah berhasil mengaktifasi akun perusahaan anda.Silahkan melakukan aktifitas dengan akun perusahaan anda dan menemukan calon karyawan terbaik anda.</p>
                                            </div>
                                            <p>Terima kasih</p>
                                            <br>
                                            <p>LokerKLU Team</p>
                                            <div style="text-align:center;padding-top:20px;padding-bottom:10px;">
                                                <p style="color: #c7c7c7;">Pesan ini telah dikirim dari LokerKLU, Inc.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `,
                };
                transporter.sendMail(mailOptions, function (err) {
                  if (err) {
                    res.json({
                      code: 500,
                      status: "SERVER_ERROR",
                      error: ["email konfirmasi validasi gagal terkirim."],
                    });
                  } else {
                    res.json({
                      code: 200,
                      status: "OK",
                      mssg: `akun dengan nama ${result1[0].companyName} berhasil di activied dan email sudah di kirim ke pihak perusahaan.`,
                    });
                  }
                });
              } else {
                res.json({
                  code: 500,
                  status: "SERVER_ERROR",
                  errors: ["akun gagal di aktivasi !!!"],
                });
              }
            })
            .catch(() => {
              res.json({
                code: 500,
                status: "SERVER_ERROR",
                errors: ["akun gagal di aktivasi !!!"],
              });
            });
        } else {
          res.json({
            code: 404,
            status: "NOT_FOUND",
            errors: ["data tidak ditemukan !!!"],
          });
        }
      })
      .catch(() => {
        res.json({
          code: 404,
          status: "NOT_FOUND",
          errors: ["data tidak ditemukan !!!"],
        });
      });
  } catch (error) {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      errors: ["data tidak ditemukan !!!"],
    });
  }
};

export const blockedAkun = async (req, res) => {
  try {
    const query = { _id: req.body._id };
    const query2 = { auth_token: false, password: false };
    const query3 = { company_id: req.body._id };
    const data = await Company.find(query, query2);
    const lokers = await Lokers.find(query3);
    if (data[0].company_images.length) {
      for (const d of data[0].company_images) {
        await remove(d);
      }
    }
    if (lokers.length) {
      lokers.map(async (loker) => {
        if (loker.fileField.file) {
          await remove(loker.fileField.file);
        }
      });
    }
    Company.deleteMany(query)
      .then((result) => {
        if (result.deletedCount > 0) {
          Lokers.deleteMany(query3)
            .then((result2) => {
              if (result2.deletedCount > 0) {
                const transporter = nodemailer.createTransport({
                  service: "gmail",
                  secure: true,
                  auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASS,
                  },
                });
                var mailOptions = {
                  from: "'LokerKLU' <no-reply@gmail.com>",
                  to: data[0].email,
                  subject: "Loker-Klu Security Error",
                  html: `
                                <div class="container" style="padding:50px 5%;background:#eaeaea;">
                                    <div class="con" style="max-width:580px;padding:0 30px;background:#ffff;">
                                        <div class="head" style="padding-top:25px;">
                                            <img src="https://lokerklu.info/Logo1.png" alt="icon" style="width:150px;">
                                        </div>
                                        <div class="body" style="padding-left:10px;margin-top:40px;">
                                            <h4>Mohon maaf team kami menganggap bahwa akun perusahaan anda tidak valid,</h4> 
                                            <h4>Maka dari itu akun perusahaan dengan :</h4>
                                            <div style="line-height:normal;">
                                                <p><strong>nama : </strong>${data[0].companyName}</p>
                                                <p><strong>email : </strong>${data[0].email}</p>
                                                <p><strong>nomor : </strong>${data[0].nomor}</p>
                                                <p><strong>tipe perusahaan : </strong>${data[0].companyType}</p>
                                                <p><strong>alamat : </strong>${data[0].addres.jalan},${data[0].addres.kec},${data[0].addres.kabkota}</p>
                                                <p><strong>waktu : </strong>${new Date().toDateString()}</p>
                                            </div>
                                            <div>
                                                <h3>Terpaksa kami Non-Aktifkan</h3>
                                            </div>
                                            <p>Terima kasih</p>
                                            <br>
                                            <p>LokerKLU Team</p>
                                            <div style="text-align:center;padding-top:20px;padding-bottom:10px;">
                                                <p style="color: #c7c7c7;">Pesan ini telah dikirim dari LokerKLU, Inc.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `,
                };
                transporter.sendMail(mailOptions, function (err) {
                  if (err) {
                    res.json({
                      code: 500,
                      status: "SERVER_ERROR",
                      error: ["mengirim perusahaan email blocked gagal !!!"],
                    });
                  } else {
                    res.json({
                      code: 200,
                      status: "OK",
                      mssg: `akun perusahaan dengan nama ${data[0].companyName} berhasil di block.`,
                    });
                  }
                });
              } else {
                res.json({
                  code: 404,
                  status: "NOT_FOUND",
                  errors: ["akun perusahaan tidak ditemukan !!!"],
                });
              }
            })
            .catch(() => {
              res.json({
                code: 404,
                status: "NOT_FOUND",
                errors: ["akun perusahaan tidak ditemukan !!!"],
              });
            });
        } else {
          res.json({
            code: 404,
            status: "NOT_FOUND",
            errors: ["akun perusahaan tidak ditemukan !!!"],
          });
        }
      })
      .catch(() => {
        res.json({
          code: 500,
          status: "SERVER_ERROR",
          errors: ["proses block akun perusahaan gagal !!!"],
        });
      });
  } catch (error) {
    res.json({
      code: 500,
      status: "SERVER_ERROR",
      errors: ["proses block akun perusahaan gagal !!!"],
    });
  }
};

export const addCompanyDesc = (req, res) => {
  try {
    const query1 = { _id: req.body._id };
    const query2 = { company_desc: req.body.desc };
    const query3 = { activied: 0, password: 0, auth_token: 0 };
    Company.updateMany(query1, query2)
      .then(async (result) => {
        if (result.modifiedCount > 0) {
          let company = await Company.find(query1, query3);
          res.json({
            code: 200,
            status: "OK",
            company,
            mssg: "membuat deskripsi berhasil",
          });
        } else {
          res.json({
            code: 500,
            status: "SEVER_ERROR",
            errors: ["membuat deskripsi gagal !!"],
          });
        }
      })
      .catch(() => {
        res.json({
          code: 500,
          status: "SEVER_ERROR",
          errors: ["membuat deskripsi gagal !!"],
        });
      });
  } catch (error) {
    res.json({
      code: 500,
      status: "SEVER_ERROR",
      errors: ["membuat deskripsi gagal !!"],
    });
  }
};

export const addCompanyReview = async (req, res) => {
  try {
    const query1 = { _id: req.body._id };
    const companie = await Company.find(query1)
    const isDuplicate = companie[0].company_reviews.filter(review => {return review.user_id == req.body.user_id})
    if (isDuplicate.length) {
      res.json({
        code: 500,
        status: "SERVER_ERROR",
        errors: ["anda sudah memberikan penilaian !!!."],
      });
    } else {
      let data = {
        user_id: req.body.user_id,
        fullname: req.body.fullname,
        stars: req.body.stars,
        alasan: req.body.alasan,
        rateing_at: new Date(),
      };
      const query2 = { $push: { company_reviews: data } };
      const query3 = { activied: 0, password: 0, auth_token: 0 };
      Company.updateMany(query1, query2)
        .then(async (result) => {
          if (result.modifiedCount > 0) {
            const companies = await Company.find(query1, query3);
            res.json({
              code: 200,
              status: "OK",
              companies,
              mssg: "mengirim penilaian berhasil",
            });
          } else {
            res.json({
              code: 500,
              status: "SERVER_ERROR",
              errors: ["mengirim penilaian gagal"],
            });
          }
        })
        .catch(() => {
          res.json({
            code: 500,
            status: "SERVER_ERROR",
            errors: ["mengirim penilaian gagal"],
          });
        });
    }
  } catch (error) {
    res.json({
      code: 500,
      status: "SERVER_ERROR",
      errors: ["mengirim penilaian gagal"],
    });
  }
};

export const twoAuthenticator = async (req, res) => {
  try {
    const query = { email: req.body.email,activied: true };
    let data = await Company.find(query);
    if (data.length) {
      let idFactoryToken = genFactoryToken(data[0]._id, data[0].email);
      let passFactoryToken = genFactoryToken(data[0]._id, data[0].password);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      });
      var mailOptions = {
        from: "'LokerKLU' <no-reply@gmail.com>",
        to: data[0].email,
        subject: "Loker-Klu Two Factory Authenticator Account",
        html: `
                               <div class="container" style="padding:50px 5%;background:#eaeaea;">
                                    <div class="con" style="max-width:580px;padding:0 30px;background:#ffff;">
                                        <div class="head" style="padding-top:25px;">
                                            <img src="https://lokerklu.info/Logo1.png" alt="icon" style="width:150px;">
                                        </div>
                                        <div class="body" style="padding-left:10px;margin-top:40px;">
                                            <h2>Selamat Datang Di Laman</h2>
                                            <h2>Loker-Klu Two-Factory-Authenticator</h2>
                                            <div>
                                                <p>Segera lakukan refactory password karena url token akan kadaluarsa dalam 5 menit !!!</p></div>
                                            <div>
                                                <h2>Click <button><a href="https://lokerklu.info/companies/session/recover?_id=${idFactoryToken}&factory_token=${passFactoryToken}">DiSini</a></button> Untuk Mereset Sandi</h2></div>
                                            <p>Terima kasih</p>
                                            <br>
                                            <p>LokerKLU Team</p>
                                            <div style="text-align:center;padding-top:20px;padding-bottom:10px;">
                                                <p style="color: #c7c7c7;">Pesan ini telah dikirim dari LokerKLU, Inc.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                      `,
      };
      transporter.sendMail(mailOptions, function (err) {
        if (err) {
          res.json({
            code: 500,
            status: "SERVER_ERROR",
            errors: ["user tidak terauthentikasi !!!."],
          });
        } else {
          res.json({
            code: 200,
            status: "OK",
            mssg: `email two-factory-authenticator telah dikirimkan.
                              Segera lakukan langkah factory password karena url token akan kadaluarsa dalam 5 menit`,
          });
        }
      });
    } else {
      res.json({
        code: 404,
        status: "NOT_AUTHENTICATE",
        errors: ["user tidak terauthentikasi !!!."],
      });
    }
  } catch (error) {
    res.json({
      code: 404,
      status: "NOT_AUTHENTICATE",
      errors: ["user tidak terauthentikasi !!!."],
    });
  }
};

export const refactoryPassword = async (req, res) => {
  let isIdTokenValid = verifyJwtToken(req.body._id);
  let isFactoryTokenValid = verifyJwtToken(req.body.factory_token);
  if (isIdTokenValid && isFactoryTokenValid) {
    try {
      const query = {
        $and: [
          {activied: true},
          { email: isIdTokenValid.password },
          { password: isFactoryTokenValid.password },
        ],
      };
      let data = await Company.find(query);
      if (data.length) {
        let newPassword = genPass(req.body.Password1);
        const query1 = { email: data[0].email };
        const query2 = { password: newPassword };
        await Company.updateMany(query1, query2)
          .then((result) => {
            if (result.modifiedCount > 0) {
              const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      });
      var mailOptions = {
        from: "'LokerKLU' <no-reply@gmail.com>",
        to: data[0].email,
        subject: "Loker-Klu Two Factory Authenticator Account",
        html: `
                               <div class="container" style="padding:50px 5%;background:#eaeaea;">
                                    <div class="con" style="max-width:580px;padding:0 30px;background:#ffff;">
                                        <div class="head" style="padding-top:25px;">
                                            <img src="https://lokerklu.info/Logo1.png" alt="icon" style="width:150px;">
                                        </div>
                                        <div class="body" style="padding-left:10px;margin-top:40px;">
                                            <p>kami sudah memverifikasi perubahan sandi dari perusahaan dengan nama ${data[0].companyName} : </p>
                                            <div style="line-height:normal">
                                                <p><strong>email : </strong>${data[0].email}</p>
                                                <p><strong>sandi baru : </strong>${req.body.Password1}</p>
                                                <p><strong>waktu : </strong>${new Date().toDateString()}</p>
                                            </div>
                                            <div>
                                                <p>Anda menerima pesan ini karena berhasil merubah sandi akun ${data[0].email}. Jika Anda yakin proses perubahan ini mencurigakan, harap segera setel ulang kata sandi Anda.</p>
                                            </div>
                                            <div>
                                                <p>Jika Anda mengetahui proses perubahan ini, harap abaikan pemberitahuan ini. Hal ini dapat terjadi ketika Anda menggunakan mode penyamaran atau penjelajahan pribadi atau menghapus cookie Anda.</p>
                                            </div>
                                            <p>Terima kasih</p>
                                            <br>
                                            <p>LokerKLU Team</p>
                                            <div style="text-align:center;padding-top:20px;padding-bottom:10px;">
                                                <p style="color: #c7c7c7;">Pesan ini telah dikirim dari LokerKLU, Inc.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                      `,
      };
      transporter.sendMail(mailOptions, function (err) {
        if (err) {
          res.json({
            code: 500,
            status: "SERVER_ERROR",
            errors: ["email konfirmasi gagal terkirim !!!."],
          });
           } else {
               res.json({
                    code: 200,
                    status: "OK",
                    mssg: "proses refactory password berhasil."
               })
              }
             });
            } else {
              res.json({
                code: 401,
                status: "NOT_AUTHENTICATE",
                errors: ["prosess refactory password gagal !!!."],
              });
            }
          })
          .catch(() => {
            res.json({
              code: 401,
              status: "NOT_AUTHENTICATE",
              errors: ["prosess refactory password gagal !!!."],
            });
          });
      } else {
        res.json({
          code: 401,
          status: "NOT_AUTHENTICATE",
          errors: ["prosess refactory password gagal !!!."],
        });
      }
    } catch (error) {
      res.json({
        code: 401,
        status: "NOT_AUTHENTICATE",
        errors: ["prosess refactory password gagal !!!."],
      });
    }
  } else {
    res.json({
      code: 401,
      status: "NOT_AUTHENTICATE",
      errors: ["prosess refactory password gagal !!!."],
    });
  }
};
