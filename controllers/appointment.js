const Appointment = require('../models/Appointment');
const Dentist = require('../models/Dentist');

//@desc    Get all appointments
//@route   GET /api/v1/appointments
//@access  Private
exports.getAppointments=async(req,res,next)=>{
    let query;
    //General uers can see only their appointments!
    if(req.user.role !== 'admin'){
        query=Appointment.find({user:req.uer.id}).populate({
            path:'dentist',
            select: 'name yearsOfExperience areaOfExpertise'
        });
    }else{ //If you are an admin, you can see all!
        if(req.params.dentistId){
            query=Appointment.find({dentist:req.params.dentistId}).populate({
                path:'dentist',
                select: 'name yearsOfExperience areaOfExpertise'
            });
        } else {
            query=Appointment.find().populate({
                path:'dentist',
                select: 'name yearsOfExperience areaOfExpertise'
            });
        }
    }
    try{
        const appointments= await query;
        res.status(200).json({
            success:true,
            count:appointments.length,
            data:appointments
        });
    } catch (error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot find Appointment"});
    }
}

//@desc    Get single appointment
//@route   GET /api/v1/appointments/:id
//@access  Public
exports.getAppointment = async(req,res,next)=>{
    try{
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'dentist',
            select: 'name yearsOfExperience areaOfExpertise'
        })
        if(!appointment){
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`});
        }
        res.status(200).json({ success:true, data:appointment });
    }catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,message:"Cannot find Appointment"});
    }
}

//@desc    Add single appointment
//@route   POST /api/v1/dentists/:dentistId/appointments/
//@access  Private
exports.addAppointment = async(req,res,next)=>{
    try {
        req.body.dentist = req.params.dentistId;
        const dentist = await Dentist.findById(req.params.dentistId);
        if(!dentist){
            return res.status(404).json({success:false,message:`No dentist with the id of ${req.params.dentistId}`});
        }

        //add user Id to req.body
        req.body.user=req.user.id;

        //Check for existed appointment
        const existedAppointments=await Appointment.find ({user:req.user.id});

        //If the user is not an admin, théy can only create 1 appointment.
        if(existedAppointments.length >= 1 && req.user.role !== 'admin'){
            return res.status(400).json({success:false,message:`The user with Id ${req.user.id} user to book only ONE session`});
        }

        const appointment = await Appointment.create(req.body);
        res.status(200).json({ success:true, data:appointment });

    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({success:false,message:"Cannot create Appointment"});

    }
}

//@desc    Update appointment
//@route   PUT /api/v1/appointments/:id
//@access  Private
exports.updateAppointment = async(req,res,next)=>{
    try{
        let appointment= await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`});
        }

        //Make sure user is the appointment owner
        if(appointment.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this appointment`});
        }

        
        appointment= await Appointment.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });

        res.status(200).json({
            success:true,
            data:appointment });
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot update Appointment"});
    }
}

//@desc     Delete appointment
//@route    DELETE /api/v1/appointment/:id
//@access   Private
exports.deleteAppointment= async (req,res,next)=>{
    try {
        const appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false,message:`No appointment with id ${req.params.id}`});
        }

        //Make sure user is the appointment owner
        if(appointment.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this bootcamp`});
        }

        await appointment.remove();
        res.status(200).json({success:true, data:{}});
    } catch(err) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot delete Appointment"});
    }
}
