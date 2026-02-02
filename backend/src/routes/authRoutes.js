const express = require('express');
const AuthController = require('../controllers/authController');
const {auth} = require('../middleware/auth')

const router = express.Router();

//public routes

router.post('/register',AuthController.register);
router.post('/login',AuthController.login);
router.post('/refresh',AuthController.refresh);
router.post('/logout',AuthController.Logout);


//proteced route

router.get('/me',auth,AuthController.getMe)



module.exports=router;