import UserModel from '../model/User.model.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ENV from '../config.js'
import otpGenerator from 'otp-generator';

/** middleware for verify user */
export async function verifyUser(req, res, next){
    try {
        
        const { username } = req.method == "GET" ? req.query : req.body;

        // check the user existance
        let exist = await UserModel.findOne({ username });
        if(!exist) return res.status(404).send({ error : "Can't find User!"});
        next();

    } catch (error) {
        console.error(error);
        return res.status(404).send({ error: "Authentication Error"});
    }
}


/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}


*/


export async function register(req,res){
    try {
        const { username, password, profile, email } = req.body;

        const existUsername = await UserModel.findOne({ username });
        if(existUsername) throw ({ error : "Please use unique username"});

        const existEmail = await UserModel.findOne({ email });
        if(existEmail) throw ({ error : "Please use unique Email"});

        if(password){
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new UserModel({
                username,
                password: hashedPassword,
                profile: profile || '',
                email
            });

            const result = await user.save();
            return res.status(201).send({ msg: "User Register Successfully"});
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: error.message });
    }
}




// // /** POST: http://localhost:8080/api/login 
// //  * @param: {
// //   "username" : "example123",
// //   "password" : "admin123"
// // }
// // */
export async function login(req,res){
   
    const { username, password } = req.body;

    try {
        
        const user = await UserModel.findOne({ username });
        if(!user) return res.status(404).send({ error : "Username not Found"});

        const passwordCheck = await bcrypt.compare(password, user.password);
        if(!passwordCheck) return res.status(400).send({ error: "Password does not Match"});

        // create jwt token
        const token = jwt.sign({
            userId: user._id,
            username : user.username
        }, ENV.JWT_SECRET , { expiresIn : "24h"});

        return res.status(200).send({
            msg: "Login Successful...!",
            username: user.username,
            token
        });                                    

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: error.message });
    }
}


// /** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req,res){
    
    const { username } = req.params;

    try {
        
        if(!username) return res.status(501).send({ error: "Invalid Username"});

        const user = await UserModel.findOne({ username });
        if(!user) return res.status(501).send({ error : "Couldn't Find the User"});

        /** remove password from user */
        // mongoose return unnecessary data with object so convert it into json
        const { password, ...rest } = Object.assign({}, user.toJSON());

        return res.status(201).send(rest);

    } catch (error) {
        console.error(error);
        return res.status(404).send({ error : "Cannot Find User Data"});
    }

}


// /** PUT: http://localhost:8080/api/updateuser 
//  * @param: {
//   "header" : "<token>"
// }
// body: {
//     firstName: '',
//     address : '',
//     profile : ''
// }
// */
export async function updateUser(req,res){
    try {
        
        const { userId } = req.user;

        if(userId){
            const body = req.body;

            // update the data
            const user = await UserModel.findByIdAndUpdate(userId, body, { new: true });
            if (!user) return res.status(404).send({ error : "Couldn't Find the User"});

            return res.status(201).send({ msg : "Record Updated...!"});

        } else {
            return res.status(401).send({ error : "User Not Found...!"});
        }

    } catch (error) {
        console.error(error);
        return res.status(401).send({ error: error.message });
    }
}


// /** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req,res){
    try {
        req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false})
        console.log(`Generated OTP: ${req.app.locals.OTP}`);
        return res.status(201).send({ code: req.app.locals.OTP });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: error.message });
    }
}



// /** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req,res){
    const { code } = req.query;
    console.log(`Received OTP: ${code}`);
    console.log(`Generated OTP: ${req.app.locals.OTP}`);

    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null; // reset the OTP value
        req.app.locals.resetSession = true; // start session for reset password
        return res.status(201).send({ msg: 'Verify Successsfully!'})
    }
    return res.status(400).send({ error: "Invalid OTP"});
}



// // successfully redirect user when OTP is valid
// /** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req,res){
    console.log(`Current resetSession value: ${req.app.locals.resetSession}`);

    if(req.app.locals.resetSession){
        return res.status(201).send({ flag : req.app.locals.resetSession})
    }
    return res.status(440).send({error : "Session expired!"})
}



// // update the password when we have valid session
// /** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req,res){
    try {
        
        if(!req.app.locals.resetSession) return res.status(440).send({error : "Session expired!"});

        const { username, password } = req.body;

        const user = await UserModel.findOne({ username});
        if(!user) return res.status(404).send({ error : "Username not Found"});

        const hashedPassword = await bcrypt.hash(password, 10);
        await UserModel.updateOne({ username : user.username }, { password: hashedPassword});

        req.app.locals.resetSession = false; // reset session
        return res.status(201).send({ msg : "Record Updated...!"})

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: error.message });
    }
}


