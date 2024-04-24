var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const exphbs = require('express-handlebars');
const app = express();
const collegeData = require('./modules/collegeData');


//Set up the server to use the "public" and "views" directory to serve static files:
app.use(express.static('public'));
app.use(express.static('views'));

//Add body parser to the server:
app.use(express.urlencoded({ extended: true }));

// Define a custom Handlebars helper to negate a boolean value:
const Handlebars = require('handlebars');
Handlebars.registerHelper('not', function(value) {
    return !value;
});

//Set up the server to use handlebars:
app.engine(".hbs", exphbs.engine({ 
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
            return '<li' +((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +'><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');

//Add the property "activeRoute" to "app.locals" whenever the route changes, ie: if the route is "/students/add", the app.locals.activeRoute value will be "/students/add".
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});


//Initialize the data:
collegeData.initialize()
    .then(function(dataCollection) {
        //http://localhost:8080/
        app.get('/', (req, res) => {
            res.render('home');
        });

        //http://localhost:8080/about
        app.get('/about', (req, res) => {
            res.render('about');
        });

        //http://localhost:8080/htmlDemo
        app.get('/htmlDemo', (req, res) => {
            res.render('htmlDemo');
        });


        
        /* --------- STUDENT ROUTES:------------ */

        //http://localhost:8080/students
        //http://localhost:8080/students?course=2
        app.get('/students', (req, res) => {
            const course = req.query.course;
            if(course){
                collegeData.getStudentsByCourse(dataCollection, course)
                .then((students) => {
                    res.render('students',{students: students});
                })
                .catch(() => {
                    res.render('students', {message: "No results"})
                });
            } else {
                collegeData.getAllStudents(dataCollection)
                .then((students) => {
                    if(students.length > 0){
                        res.render('students',{students: students});
                    } else {
                        res.render('students', {message: "No results"})
                    }
                })
                .catch(() => {
                    res.render('students', {message: "No results"})
                });
            }
        });

        //http://localhost:8080/student/1
        app.get("/student/:studentNum", (req, res) => {
            let viewData = {};
            
            collegeData.getStudentByNum(dataCollection, req.params.studentNum)
                .then((student) => {
                    if (student) {
                        viewData.student = student;
                    } else {
                        throw new Error("Student not found");
                    }
                })
                .then(() => collegeData.getCourses(dataCollection))
                .then((courses) => {
                    viewData.courses = courses;
                    // Loop through courses to mark the selected course
                    viewData.courses.forEach((course) => {
                        if (course.courseId === viewData.student.courseId) {
                            course.selected = true;
                        }
                    });
                })
                .then(() => {
                    res.render("student", { viewData: viewData });
                })
                .catch((err) => {
                    res.status(404).send("Student Not Found");
                });
        });
        
        //http://localhost:8080/students/add
        app.get('/students/add', (req, res) => {
            collegeData.getCourses(dataCollection)
            .then((courses) => {
                res.render('addStudent', {courses: courses});
            })
            .catch(() => {
                res.render('addStudent', {courses: []});
            });
        });
        
        // POST route to handle adding a new student
        app.post('/students/add', (req, res) => {
            const newStudentData = req.body;
            // newStudentData.courseId = req.body.courseId;
            collegeData.addStudent(newStudentData, dataCollection)
                .then(() => {
                    res.redirect('/students');
                })
                .catch((err) => {
                    res.status(500).send(err);
                });
        });

        //http://localhost:8080/student/update
        app.post('/student/update', (req, res) => {
            collegeData.updateStudent(req.body, dataCollection)
                .then(() => {
                    res.redirect('/students');
                })
                .catch((err) => {
                    res.status(500).send(err);
                });
        });

        //http://localhost:8080/student/delete/1
        app.get('/student/delete/:studentNum', (req, res) => {
            const studentNum = req.params.studentNum;
            collegeData.deleteStudentByNum(studentNum)
            .then(() => {
                res.redirect('/students');
            })
            .catch(() => {
                res.status(500).send("Unable to delete student.");
            });
        });



        
        /* --------- COURSE ROUTES:------------ */

        //http://localhost:8080/courses
        app.get('/courses', (req, res) => {
            collegeData.getCourses(dataCollection)
            .then((courses) => {
                if(courses.length > 0){
                    res.render('courses',{courses: courses});
                } else {
                    res.render('courses', {message: "No results"})
                }
            })
            .catch(() => {
                res.render('courses', {message: "No results"})
            });
        });
        
        // http://localhost:8080/course/1
        app.get('/course/:id', (req, res) => {
            const id = req.params.id;
            collegeData.getCourseById(dataCollection, id)
            .then((course) => {
                if(course){
                    res.render("course", { course: course });
                } else {
                    res.status(404).send("Course Not Found");
                }
            })
            .catch((err) => {
                res.status(404).send("Course Not Found");
            });
        });

        //http://localhost:8080/courses/add
        app.get('/courses/add', (req, res) => {
            res.render('addCourse');
        });

        // POST route to handle adding a new course
        app.post('/courses/add', (req, res) => {
            collegeData.addCourse(req.body, dataCollection)
                .then(() => {
                    res.redirect('/courses');
                })
                .catch((err) => {
                    res.status(500).send(err);
                });
        });

        //http://localhost:8080/course/update
        app.post('/course/update', (req, res) => {
            collegeData.updateCourse(req.body, dataCollection)
                .then(() => {
                    res.redirect('/courses');
                })
                .catch((err) => {
                    res.status(500).send(err);
                });
        });

        //http://localhost:8080/course/delete/1
        app.get('/course/delete/:id', (req, res) => {
            const id = req.params.id;
            collegeData.deleteCourseById(id)
            .then(() => {
                res.redirect('/courses');
            })
            .catch(() => {
                res.status(500).send("Unable to delete course.");
            });
        });



        /* --------- INSTRUCTOR ROUTES:------------ */

        //If the user enters a route that is not matched with anything, return the custom message "Page Not Found":
        app.use((req, res) => {
            res.status(404).send('Page Not Found');
        });

        //Start the server:
        app.listen(HTTP_PORT, () => {
            console.log(`Listening on port ${HTTP_PORT}`);
        });
    })
    
    //If the data cannot be initialized, log the error:
    .catch(function(error) {
        console.error(`Failed to initialize data ${error}`);
    });
