create database ASSESS_EASY;
use ASSESS_EASY;

create table users
(
userID int primary key auto_increment,
firstName varchar(50),
lastName varchar(50),
email varchar(100),
password blob,
contact varchar(30),
createdOn date,
updatedOn date

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
passingMarks int

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
mcqText blob,
correctOption blob,
optionB blob,
optionC blob,
optionD blob,
marks int

);

create table tf_questions
(
tfID int primary key auto_increment,
tfText blob,
correctOption varchar(10),
marks int

);

create table long_questions
(
tfID int primary key auto_increment,
tfText blob,
marks int

);

create table test_question
(
tqID int auto_increment primary key,
questionID int,
testID int,
questionType varchar(3)

);



