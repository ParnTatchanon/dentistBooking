const mongoose = require('mongoose');
const bcrypt = require ('bcryptjs');
const jwt = require('jsonwebtoken');
const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Please add a name']
    },
    telephoneNumber:{
        type: String,
        required: [true,'Please add a telephone number'],
        match: [/^0([8|9|6])([0-9]{8}$)/, 'Enter a valid phone number'],
        maxlength:[20,'Telephone number can not be more than 20 characters']
    },
    email:{
        type: String,
        required: [true,'Please add a email'],
        unique: true,
        match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please add a valid email']
    },
    role: {
        type: String,
        enum: ['user','admin'],
        default: 'user'
    },
    password:{
        type: String,
        required: [true,'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt:{
        type: Date,
        default: Date.now
    }
});
//Encrypt password using bcrypt
UserSchema.pre('save',async function(next){
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    });
}

//Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports=mongoose.model('User',UserSchema);
