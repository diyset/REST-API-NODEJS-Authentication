const User = require('../../db/models').User
const bCrypt = require('bcrypt-nodejs')
const jwt = require('jsonwebtoken')
const SeedRandom = require('seedrandom')

module.exports = {
    create(req, res) {

        var generateKodeKaryawan = (name, email) => {
            return 'P' + Math.abs(SeedRandom(name + email).int32());
        }

        payload = {
            name: req.body.name,
            email: req.body.email,
            kode_karyawan: generateKodeKaryawan(req.body.name),
            isAdmin: req.body.isadmin
        }

        let generateCrypt = (password) => {
            return bCrypt.hashSync(password, bCrypt.genSaltSync(4), null);
        }
        let userPassword = generateCrypt(req.body.password)

        return User
            .findOne({
                where: {
                    username: req.body.username,
                    email: req.body.email
                }
            })
            .then((result) => {
                if (result) {
                    return res.status(400).send({
                        code: 90,
                        error: true,
                        message: 'Username sudah ada!'
                    })
                }
                User
                    .create({
                        name: req.body.name,
                        email: req.body.email,
                        kode_karyawan: generateKodeKaryawan(req.body.name, req.body.email).substring(0, 5),
                        password: userPassword,
                        username: req.body.username,
                        isAdmin: req.body.isAdmin ? 1 : 0
                    })
                    .then((result, err) => {
                        if (err) {
                            next(err);
                        } else {
                            res.json({
                                status: "success",
                                message: "User Added successfully!!",
                            })
                        }
                    })
            })
    },
    authenticate(req, res, next) {
        return User
            .findOne({
                where: {
                    email: req.body.email
                }
            })
            .then((userInfo, err) => {
                if (err) {
                    next(err)
                } else {
                    if (userInfo) {
                        if (bCrypt.compareSync(req.body.password, userInfo.password)) {
                            if (userInfo.isAdmin) {
                                const token = jwt.sign({
                                    id: userInfo.id,
                                    name: userInfo.name,
                                    kodeKaryawan: userInfo.kode_karyawan,
                                    isSuperUser: userInfo.isAdmin
                                }, req.app.get('secretKey'), {
                                    expiresIn: '24h'
                                })
                                res.status(202).send({
                                    status: 'success',
                                    message: 'User Found!',
                                    isSuperUser: userInfo.isAdmin,
                                    token: token
                                })
                            } else {
                                const token = jwt.sign({
                                    id: userInfo.id,
                                    name: userInfo.name,
                                    kodeKaryawan: userInfo.kode_karyawan,
                                    isSuperUser: userInfo.isAdmin
                                }, req.app.get('secretKey'), {
                                    expiresIn: '1h'
                                })
                                res.status(202).send({
                                    status: 'success',
                                    message: 'User Found!',
                                    isSuperUser: userInfo.isAdmin,
                                    token: token
                                })
                            }
                        } else {
                            res.status(400).send({
                                code: 90,
                                error: true,
                                message: 'Invalid Password/Email'
                            })
                        }
                    } else {
                        res.status(400).send({
                            code: 90,
                            error: true,
                            message: 'Email is Never Register!'
                        })
                    }
                }
            })
    },
    getUserByUsername(req,res){

        return User
                .findOne({
                    where:{
                        username: req.params.username
                    }
                })
                .then((result)=>{
                    if(result){
                       return res.status(200).send({
                            code:'00',
                            error:false,
                            data:result
                        })
                    }
                    return res.status(400).send({
                        code:99,
                        error:true,
                        message:'Data Not Found!'
                    })
                }).catch((error)=>res.status(400).send(error))
    },
    checkUsernameAvailability(req,res){

        return User
                .findOne({
                    where:{
                        username: req.params.username
                    }
                })
                .then((result)=>{
                    console.log(result)
                    if(!result){
                        return res.status(200).send({
                            available: true,
                        })
                    } else {
                        return res.status(200).send({
                            available : false,
                        })
                    }
                })
    },
    checkEmailAvailability(req,res){

        return User
                .findOne({
                    where:{
                        email: req.params.email
                    }
                })
                .then((result)=>{
                    console.log(result)
                    if(!result){
                        return res.status(200).send({
                            available: true,
                        })
                    } else {
                        return res.status(200).send({
                            available : false,
                        })
                    }
                })
    }
  
}
