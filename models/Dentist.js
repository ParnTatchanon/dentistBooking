const mongoose = require("mongoose");

const DentistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    yearsOfExperience: {
      type: String,
      required: [true, "Please add an years of experience"],
    },
    areaOfExpertise: {
      type: String,
      required: [true, "Please add a area of expertise"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  {
    versionKey: false,
  }
);

//Reverse populate with virtuals
DentistSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "dentist",
  justOne: false,
});

//Cascade dalate bookings when a dentist is delete
DentistSchema.pre("remove", async function (next) {
  console.log(`Bookings being removed from dentist ${this._id}`);
  await this.model("Booking").deleteMany({ dentist: this._id });
  next();
});

module.exports = mongoose.model("Dentist", DentistSchema);
