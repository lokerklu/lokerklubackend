import multer from "multer";
import express from "express";
import verifyToken from "../middleware/auth.js";
import verifyUserToken from "../middleware/userAuth.js";
import verifyAdminToken from "../middleware/authAdmin.js";
import { adminAuth,adminLogin,getAllActivity,getCompanyApplyed } from "../controllers/adminController.js";
import { userAuth,userGoogleLogin,updateProfile,updateUserCv,updateUserPlus } from "../controllers/userController.js";
import {addChatRoom,pushUserMessage,pushCompMessage,readUserMessage,readCompanieMessage,getUserChatList,getCompanieChatList,deleteUserChat,deleteCompanieChat} from "../controllers/messageController.js";
import { addLoker,updateLoker,deleteLoker,getAllWork,getWorkById,getWorkByCompany,applyLoker,searchLokers,getLokersApplyed,sharesLoker,getLokerRecomend,deleteApply } from "../controllers/lokerController.js";
import { companyAuth,changePassword,getCompanyById,getCompanyByName,getRecomendCompanies,companyRegistrate,companyLogin,getCompanyReq,activiedAkun,blockedAkun,getCompanyVerify,addCompanyDesc,addCompanyReview,twoAuthenticator,refactoryPassword } from "../controllers/companyController.js";

const router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({storage});

router.post("/shares/loker", sharesLoker)
router.post("/company/login", companyLogin)
router.post("/loker-klu/get/jobs", getAllWork)
router.post("/loker-klu/admin/login", adminLogin)
router.post("/loker-klu/work/detail", getWorkById)
router.post("/user/google/login", userGoogleLogin)
router.post("/loker-klu/loker/search", searchLokers)
router.post("/loker-klu/company/search", getCompanyById)
router.post("/loker-klu/user/user_auth_token", userAuth)
router.post("/loker-klu/company_auth_token", companyAuth)
router.post("/loker-klu/admin/admin_auth_token", adminAuth)
router.post("/loker-klu/companie/search", getCompanyByName)
router.post("/loker-klu/company/get/jobs", getWorkByCompany)
router.post("/company/refactory/password", refactoryPassword)   
router.post("/loker-klu/get/recomend/lokers", getLokerRecomend)
router.post("/user/delete/apply", verifyUserToken, deleteApply)
router.post("/user/addchatroom", verifyUserToken , addChatRoom)
router.post("/companie/addchatroom", verifyToken , addChatRoom)
router.post("/user/delete/chat", verifyUserToken , deleteUserChat)
router.post("/get/all/activity", verifyAdminToken, getAllActivity)
router.post("/user/update/profile", verifyUserToken, updateProfile)
router.post("/user/sendmessages", verifyUserToken , pushUserMessage)
router.post("/company/change/password", verifyToken, changePassword)   
router.post("/get/company/request", verifyAdminToken, getCompanyReq)
router.post("/get/user/chatlist", verifyUserToken , getUserChatList)
router.post("/user/readmessages", verifyUserToken , readUserMessage)
router.post("/companies/sendmessages", verifyToken , pushCompMessage)
router.post("/company/add/review", verifyUserToken, addCompanyReview)
router.post("/companies/two-factory-authenticator", twoAuthenticator)
router.post("/get/loker/applyed", verifyUserToken , getLokersApplyed)
router.post("/companie/delete/chat", verifyToken , deleteCompanieChat)
router.post("/loker-klu/get/recomend/companies", getRecomendCompanies)
router.post("/loker-klu/company/add/desc", verifyToken, addCompanyDesc)
router.post("/get/companie/chatlist", verifyToken , getCompanieChatList)
router.post("/companie/readmessages", verifyToken , readCompanieMessage)
router.post("/get/company/applyed", verifyAdminToken, getCompanyApplyed)
router.post("/loker-klu/company/loker/update", verifyToken, updateLoker)
router.post("/loker-klu/company/loker/delete", verifyToken, deleteLoker)
router.post("/get/company/verified", verifyAdminToken , getCompanyVerify)
router.post("/loker-klu/company/block/account", verifyAdminToken, blockedAkun)
router.post("/company/add/work", verifyToken, upload.single('file'), addLoker)  
router.post("/loker-klu/company/activied/account", verifyAdminToken, activiedAkun)      
router.post("/user/update/cv", verifyUserToken, upload.fields([{name: 'file', maxCount: 1}]), updateUserCv)    
router.post("/user/update/plus", verifyUserToken, upload.fields([{name: 'plus1', maxCount: 1},{name: 'plus2', maxCount: 1},{name: 'plus3', maxCount: 1}]), updateUserPlus)    
router.post("/company/registrate",upload.fields([{name: 'file1', maxCount: 1},{name: 'file2', maxCount: 1},{name: 'file3', maxCount: 1},{name: 'file4', maxCount: 1}]), companyRegistrate)
router.post("/loker-klu/company/loker/apply", verifyUserToken, upload.fields([{name: 'cv', maxCount: 1},{name: 'plus1', maxCount: 1},{name: 'plus2', maxCount: 1},{name: 'plus3', maxCount: 1}]), applyLoker)    

export default router; 
