const Sequelize = require('sequelize');
const dbConfig = require('../db_config');

var sequelize = new Sequelize(dbConfig.PGDATABASE, dbConfig.PGUSER, dbConfig.PGPASSWORD, {
    host: dbConfig.PGHOST,
    dialect: dbConfig.DIALECT,
    port: dbConfig.PGPORT,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query:{ raw: true }
});


var StudentModel = sequelize.define('Student', {
    studentNum: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

var CourseModel = sequelize.define('Course', {
    courseId: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

CourseModel.hasMany(StudentModel, {foreignKey: 'courseId'});


function initialize() {
    return new Promise(function (resolve, reject) {
        sequelize.sync()
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject("Unable to sync the database" + err.message);
        });
    });
};


function getAllStudents(dataCollection){
    return new Promise(function (resolve, reject) {
        StudentModel.findAll()
        .then((students) => {
            resolve(students);
        })
        .catch((err) => {
            reject("No results returned");
        });
    });

};


function getCourses(dataCollection){
    return new Promise(function (resolve, reject) {
        CourseModel.findAll()
        .then((courses) => {
            resolve(courses);
        })
        .catch((err) => {
            reject("No results returned" + err.message);
        });
    });

};


function getStudentsByCourse(dataCollection,course){
    return new Promise(function (resolve, reject) {
        StudentModel.findAll({
            where: {
                courseId: course
            }
        })
        .then((students) => {
            resolve(students);
        })
        .catch((err) => {
            reject("No results returned"+ err.message);
        });
    });
};


function getStudentByNum(dataCollection,num){
    return new Promise(function (resolve, reject) {
        StudentModel.findAll({
            where: {
                studentNum: num
            }
        })
        .then((students) => {
            resolve(students[0]);
        })
        .catch((err) => {
            reject("No results returned"+ err.message);
        });
    });
};


function addStudent(studentData, dataCollection){
    studentData.TA = (studentData.TA) ? true : false;
    for (const key in studentData) {
        if (studentData[key] === "") {
            studentData[key] = null;
        }
    }
    return new Promise(function (resolve, reject) {
        StudentModel.create(studentData)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject("unable to create student"+err.message);
        });
    });
};


function getCourseById(dataCollection, id){
    return new Promise(function (resolve, reject) {
        CourseModel.findAll({
            where: {
                courseId: id
            }
        })
        .then((courses) => {
            resolve(courses[0]);
        })
        .catch((err) => {
            reject("No results returned"+ err.message);
        });
    });
};


function updateStudent(studentData, dataCollection){
    studentData.TA = (studentData.TA) ? true : false;
    for (const key in studentData) {
        if (studentData[key] === "") {
            studentData[key] = null;
        }
    }
    return new Promise(function (resolve, reject) {
        StudentModel.update(studentData, {
            where: {
                studentNum: studentData.studentNum
            }
        })
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject("unable to update student"+err.message);
        });
    });
};


function addCourse(courseData, dataCollection){
    for (const key in courseData) {
        if (courseData[key] === "") {
            courseData[key] = null;
        }
    }
    return new Promise(function (resolve, reject) {
        CourseModel.create(courseData)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject("unable to create course"+err.message);
        });
    });
};


function updateCourse(courseData, dataCollection){
    for (const key in courseData) {
        if (courseData[key] === "") {
            courseData[key] = null;
        }
    }
    return new Promise(function (resolve, reject) {
        CourseModel.update(courseData, {
            where: {
                courseId: courseData.courseId
            }
        })
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject("unable to update course"+err.message);
        });
    });
};


function deleteCourseById(id){
    return new Promise(function (resolve, reject) {
        CourseModel.destroy({
            where: {
                courseId: id
            }
        })
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject("unable to delete course" + err.message);
        });
    });
};

function deleteStudentByNum(studentNum){
    return new Promise(function (resolve, reject) {
        StudentModel.destroy({
            where: {
                studentNum: studentNum
            }
        })
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject("unable to delete student" + err.message);
        });
    });
};

//Export functions:
module.exports = { initialize, getAllStudents, getCourses, getStudentsByCourse, getStudentByNum, addStudent, getCourseById, updateStudent, addCourse, updateCourse, deleteCourseById, deleteStudentByNum };