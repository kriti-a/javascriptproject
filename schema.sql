-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema assess_easy
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema assess_easy
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `assess_easy` DEFAULT CHARACTER SET utf8 ;
USE `assess_easy` ;

-- -----------------------------------------------------
-- Table `assess_easy`.`access_level`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`access_level` (
  `accessID` INT(11) NOT NULL AUTO_INCREMENT,
  `accessType` VARCHAR(10) NULL DEFAULT NULL,
  PRIMARY KEY (`accessID`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`assessment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`assessment` (
  `assessmentID` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NULL DEFAULT NULL,
  `deadline` DATE NULL DEFAULT NULL,
  `totalMarks` INT(11) NULL DEFAULT NULL,
  `passingMarks` INT(11) NULL DEFAULT NULL,
  `assessmentType` VARCHAR(10) NULL DEFAULT NULL,
  PRIMARY KEY (`assessmentID`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`assessment_results`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`assessment_results` (
  `arID` INT(11) NOT NULL AUTO_INCREMENT,
  `assessmentID` INT(11) NULL DEFAULT NULL,
  `userID` INT(11) NULL DEFAULT NULL,
  `obtainedMarks` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`arID`))
ENGINE = InnoDB
AUTO_INCREMENT = 252
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`class_assessment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`class_assessment` (
  `caID` INT(11) NOT NULL AUTO_INCREMENT,
  `classID` INT(11) NULL DEFAULT NULL,
  `assessmentID` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`caID`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`classes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`classes` (
  `classID` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NULL DEFAULT NULL,
  `createdOn` DATE NULL DEFAULT NULL,
  `createdBy` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`classID`))
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`lassessment_question`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`lassessment_question` (
  `laqID` INT(11) NOT NULL AUTO_INCREMENT,
  `assessmentID` INT(11) NULL DEFAULT NULL,
  `questionID` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`laqID`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`long_questions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`long_questions` (
  `lqID` INT(11) NOT NULL AUTO_INCREMENT,
  `lqText` VARCHAR(20000) NULL DEFAULT NULL,
  `marks` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`lqID`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`mc_questions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`mc_questions` (
  `mcqID` INT(11) NOT NULL AUTO_INCREMENT,
  `mcqText` VARCHAR(20000) NULL DEFAULT NULL,
  `correctOption` VARCHAR(35) NULL DEFAULT NULL,
  `optionB` VARCHAR(35) NULL DEFAULT NULL,
  `optionC` VARCHAR(35) NULL DEFAULT NULL,
  `optionD` VARCHAR(35) NULL DEFAULT NULL,
  `marks` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`mcqID`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`mcassessment_question`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`mcassessment_question` (
  `mcaqID` INT(11) NOT NULL AUTO_INCREMENT,
  `assessmentID` INT(11) NULL DEFAULT NULL,
  `questionID` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`mcaqID`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`notification`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`notification` (
  `notificationID` INT(11) NOT NULL AUTO_INCREMENT,
  `message` VARCHAR(500) NULL DEFAULT NULL,
  `type` VARCHAR(200) NULL DEFAULT NULL,
  `createdon` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`notificationID`))
ENGINE = InnoDB
AUTO_INCREMENT = 12
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`sessions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`sessions` (
  `session_id` VARCHAR(128) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_bin' NOT NULL,
  `expires` INT(11) UNSIGNED NOT NULL,
  `data` TEXT CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_bin' NULL DEFAULT NULL,
  PRIMARY KEY (`session_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`status`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`status` (
  `idstatus` INT(11) NOT NULL AUTO_INCREMENT,
  `s_text` VARCHAR(20000) NULL DEFAULT NULL,
  `userid` VARCHAR(200) NULL DEFAULT NULL,
  `classid` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`idstatus`))
ENGINE = InnoDB
AUTO_INCREMENT = 102
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`student_assessment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`student_assessment` (
  `saID` INT(11) NOT NULL AUTO_INCREMENT,
  `userID` INT(11) NULL DEFAULT NULL,
  `assessmentID` INT(11) NULL DEFAULT NULL,
  `questionID` INT(11) NULL DEFAULT NULL,
  `answer` VARCHAR(20000) NULL DEFAULT NULL,
  PRIMARY KEY (`saID`))
ENGINE = InnoDB
AUTO_INCREMENT = 148
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`tf_questions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`tf_questions` (
  `tfqID` INT(11) NOT NULL AUTO_INCREMENT,
  `tfText` VARCHAR(20000) NULL DEFAULT NULL,
  `correctOption` VARCHAR(10) NULL DEFAULT NULL,
  `marks` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`tfqID`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`tfassessment_question`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`tfassessment_question` (
  `tfaqID` INT(11) NOT NULL AUTO_INCREMENT,
  `assessmentID` INT(11) NULL DEFAULT NULL,
  `questionID` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`tfaqID`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`user_access`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`user_access` (
  `uaID` INT(11) NOT NULL AUTO_INCREMENT,
  `userID` INT(11) NULL DEFAULT NULL,
  `accessID` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`uaID`))
ENGINE = InnoDB
AUTO_INCREMENT = 19
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`user_class`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`user_class` (
  `ucID` INT(11) NOT NULL AUTO_INCREMENT,
  `userId` INT(11) NULL DEFAULT NULL,
  `classId` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`ucID`))
ENGINE = InnoDB
AUTO_INCREMENT = 20
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `assess_easy`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assess_easy`.`users` (
  `userID` INT(11) NOT NULL AUTO_INCREMENT,
  `firstName` VARCHAR(50) NULL DEFAULT NULL,
  `lastName` VARCHAR(50) NULL DEFAULT NULL,
  `email` VARCHAR(100) NULL DEFAULT NULL,
  `password` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`userID`))
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Insert Access Level
-- -----------------------------------------------------
INSERT INTO `assess_easy`.`access_level`(`accessType`)VALUES('Teacher'),('Student');