create database ASSESS_EASY;
use ASSESS_EASY;

create table users
(
userID int primary key auto_increment,
firstName varchar(50),
lastName varchar(50),
email varchar(100),
password varchar(255)

);

create table access_level
(
accessID int primary key auto_increment,
accessType varchar(10)

);

create table user_access
(
uaID int primary key auto_increment,
userID int,
accessID int

);


create table classes
(
classID int primary key auto_increment,
name varchar(50),
createdOn date,
createdBy int

);

create table user_class
(
ucID int primary key auto_increment,
userId int,
classId int

);

create table assessment
(
assessmentID int primary key auto_increment,
name varchar(50),
deadline date, 
totalMarks int,
passingMarks int,
assessmentType varchar(10)
);

create table class_assessment
(
caID int primary key auto_increment,
classID int,
assessmentID int

);

create table mc_questions
(
mcqID int primary key auto_increment,
mcqText varchar(35),
correctOption varchar(35),
optionB varchar(35),
optionC varchar(35),
optionD varchar(35),
marks int

);

create table tf_questions
(
tfqID int primary key auto_increment,
tfText varchar(35),
correctOption varchar(10),
marks int

);

create table long_questions
(
lqID int primary key auto_increment,
lqText varchar(35),
marks int

);

create table tfassessment_question
(
tfaqID int auto_increment primary key,
assessmentID int,
questionID int

);

create table mcassessment_question
(
mcaqID int auto_increment primary key,
assessmentID int,
questionID int

);

create table lassessment_question
(
laqID int auto_increment primary key,
assessmentID int,
questionID int

);

create table assessment_results
(
arID int auto_increment primary key,
assessmentID int,
userID int, 
obtainedMarks int

)


