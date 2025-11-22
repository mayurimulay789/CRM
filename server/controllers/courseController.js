const Course = require('../models/Course');
const Enrollment=require('../models/Enrollment');
const Admission=require('../models/Admission');

const createCourse = async (req, res) => {
  try {
    const { name, fee, description, duration } = req.body;

    // Check if course already exists
    const existingCourse = await Course.findOne({ name });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course with this name already exists'
      });
    }

    const course = new Course({
      name,
      fee,
      description,
      duration
    });

    const savedCourse = await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: savedCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const { active } = req.query;
    let filter = {};

    // Filter by active status if provided
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { name, fee, description, duration, isActive } = req.body;

    // Check if course exists
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if name is being changed and if it conflicts with existing course
    if (name && name !== course.name) {
      const existingCourse = await Course.findOne({ name });
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: 'Course with this name already exists'
        });
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        name,
        fee,
        description,
        duration,
        isActive
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }


    //if course is envoled in admission or enroolment then dont delete it



    // Check if course is being used in admissions (you might want to add this check)
    const admissionCount = await Admission.countDocuments({ course: req.params.id });
    if (admissionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course. It is being used in admissions.'
      });
    }
    const enrollmentCount = await Enrollment.countDocuments({ course: req.params.id });
    if (admissionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course. It is being used in Enrollment.'
      });
    }


    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

const toggleCourseStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.isActive = !course.isActive;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.isActive ? 'activated' : 'deactivated'} successfully`,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling course status',
      error: error.message
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  toggleCourseStatus
};