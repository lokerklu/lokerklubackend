import Admin from "../models/Admin.js";
import Lokers from "../models/Lokers.js";
import Company from "../models/Company.js";
import { genToken, verifyPass, verifyJwtToken} from "../generate/genPass.js";

export const adminAuth = (req,res) => {
    try {
        const isTokenvalid = verifyJwtToken(req.body.Token)
        if (isTokenvalid) {
            const query1 = {_id: isTokenvalid.id}
            const query2 = {auth_token: false}
            Admin.find(query1,query2)
            .then((result) => {
                if (result.length) {
                    const secureUser = verifyPass(result[0].password,isTokenvalid.password)
                    if (secureUser) {
                        result[0].password = ""
                        res.json({
                            code: 200,
                            status: "OK",
                            admin: result
                        })
                    } else {
                        res.json({
                            code: 404,
                            status: "NOT_FOUND",
                            errors: [
                                "tidak terauthentication !!!"
                            ]
                        })
                    }
                }else {
                    res.json({
                        code: 404,
                        status: "NOT_FOUND",
                        errors: [
                            "tidak terauthentication !!!"
                        ]
                    })
                }
            })
            .catch(() => {
                res.json({
                    code: 404,
                    status: "NOT_FOUND",
                    errors: [
                        "tidak terauthentication !!!"
                    ]
                })
            })
        } else {
            res.json({
                code: 404,
                status: "NOT_FOUND",
                errors: [
                    "tidak terauthentication !!!"
                ]
            })
        }
    } catch (error) {
        res.json({
            code: 404,
            status: "NOT_FOUND",
            errors: [
                "tidak terauthentication !!!"
            ]
        })
    }
}

export const adminLogin = (req,res) => {
    try {
        const query = {email: req.body.email}
        Admin.find(query)
        .then((result1) => {
            if (result1.length) {
                const auth = verifyPass(result1[0].password,req.body.password)
                if (auth) {
                    const token = genToken(result1[0]._id,req.body.password)
                    const query1 = {_id: result1[0]._id}
                    const query2 = {auth_token: token}
                    Admin.updateMany(query1,query2)
                    .then((result2) => {
                        if (result2.modifiedCount > 0) {
                            const admin = {
                                "_id": result1[0]._id,
                                "email": result1[0].email,
                                "auth_token": token
                            }
                            res.json({
                                code: 200,
                                status: "OK",
                                mssg: "login admin berhasil",
                                admin
                            })
                        }else {
                            res.json({
                                code: 401,
                                status: "NO_AUTHENTICATION",
                                errors: [
                                    "admin tidak terauthentication !!!."
                                ]
                            })
                        }
                    }).catch(() => {
                        res.json({
                            code: 401,
                            status: "NO_AUTHENTICATION",
                            errors: [
                                "admin tidak terauthentication !!!."
                            ]
                        })
                    })
                }else {
                    res.json({
                        code: 401,
                        status: "NO_AUTHENTICATION",
                        errors: [
                            "admin tidak terauthentication !!!."
                        ]
                    })
                }
            }else {
                res.json({
                    code: 401,
                    status: "NO_AUTHENTICATION",
                    errors: [
                        "admin tidak terauthentication !!!."
                    ]
                })  
            }
        })
        .catch((err) => {
            res.json({
                code: 401,
                status: "NO_AUTHENTICATION",
                errors: [
                    "admin tidak terauthentication !!!."
                ]
            })
        })
    } catch (error) {
        res.json({
            code: 401,
            status: "NO_AUTHENTICATION",
            errors: [
                "admin tidak terauthentication !!!."
            ]
        })
    }
} 

export const getCompanyApplyed = async (req,res) => {
  try {
    const query1 = {}
    let applyeds = []
    const lokers = await Lokers.find(query1)
    lokers.map(loker => {
      if (loker.applyeds.length) {
        loker.applyeds.map(apply => {
          applyeds.push(apply)
        })
      }
    })
    if (applyeds.length || lokers.length) {
      res.json({
        code: 200,
        status: "OK",
        lokers,
        applyeds
      })
    } else {
      res.json({
        code: 404,
        status: "NOT_FOUND",
        erros: ["data tidak ditemukan !!!"]
      })
    }
  } catch (error) {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      erros: ["data tidak ditemukan !!!"]
    })
  }
}

export const getAllActivity = async (req,res) => {
  try {
    const query1 = {}
    const query2 = {_id: false,applyeds: true}
    const query3 = { $or: [{ activied: false },{ password: "" },{activied: true}] };
    const query4 = { password: false, auth_token: false };
    let applyeds = await Lokers.find(query1,query2)
    let companies = await Company.find(query3,query4)
    let activity = []
    for (const apply of applyeds) {
      for (const app of apply.applyeds) {
        let data = {
          activity: `${app.fullname} telah melamar posisi ${app.position} di ${app.companie}`,
          time: new Date(app.applyed_at).getDate()+','+new Date(app.applyed_at).getMonth()+","+new Date(app.applyed_at).getFullYear()
        }
        activity.push(data)
      }
    }
    for (const companie of companies) {
      if (companie.activied) {
        let data = {
          activity: `${companie.companyName} telah di activied`,
          time: new Date(companie.created_at).getDate()+','+new Date(companie.created_at).getMonth()+","+new Date(companie.created_at).getFullYear()
        }
        activity.push(data)
      }else {
        let data = {
          activity: `${companie.companyName} telah terdaftar`,
          time: new Date(companie.created_at).getDate()+','+new Date(companie.created_at).getMonth()+","+new Date(companie.created_at).getFullYear()
        }
        activity.push(data)
      }
    } 
    activity.reverse()
    if (activity.length) {
      res.json({
        code: 200,
        status: "OK",
        activity
      })
    } else {
      res.json({
        code: 404,
        status: "NOT_FOUND",
        errors: [
          "data tidak ditemukan !!!."
        ]
      })
    }
  } catch (error) {
    res.json({
      code: 404,
      status: "NOT_FOUND",
      errors: [
        "data tidak ditemukan !!!."
      ]
    })
  }
}
