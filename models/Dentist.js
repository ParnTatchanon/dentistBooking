const mongoose = require('mongoose');

const DentistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Please add a name'],
        unique: true,
        trim: true,
        maxlength:[50,'Name can not be more than 50 characters']
    },
    yearsOfExperience:{
        type: String,
        required: [true,'Please add an years of experience']
    },
    areaOfExpertise:{
        type: String,
        required: [true,'Please add a area of expertise']
    }

},{
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
});

//Reverse populate with virtuals
DentistSchema.virtual('appointments',{
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'dentist',
    justOne: false
});

//Cascade dalate appointments when a dentist is delete
DentistSchema.pre('remove',async function(next){
    console.log(`Appointments being removed from dentist ${this._id}`);
    await this.model('Appointment').deleteMany({dentist:this._id});
    next();
})

module.exports=mongoose.model('Dentist',DentistSchema);
