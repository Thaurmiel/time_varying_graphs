<?php 
//activate once to create database and tables
echo "<p>Create database</p>";
$name= "localhost";
$user= "root";
$password= "";
$target_db="GG_BK";
$conn = mysqli_connect($name, $user, $password) or die(mysqli_error()); 
$db_string = mysqli_query($conn,"DROP DATABASE IF EXISTS $target_db ");
$db_string = mysqli_query($conn,"CREATE DATABASE if not exists $target_db ");

// create tables
if($db_string)
{
    echo "<p>".$db_string." <- Database status</p>";
    // 
    $query = "CREATE TABLE IF NOT EXISTS $target_db.`ROOMS` 
    (
        `id` INT NOT NULL AUTO_INCREMENT,
        `r_name` VARCHAR(255) NOT NULL DEFAULT 'ROOM',
        `r_type` VARCHAR(255) NOT NULL DEFAULT 'BIG',
        PRIMARY KEY (`id`)) ENGINE = InnoDB; 
        ";
        echo "<p>".mysqli_query($conn, $query). "<- Table ROOMS status</p>";
        //
        $query = "CREATE TABLE IF NOT EXISTS $target_db.`SENSORS` 
        (
        `id` INT NOT NULL AUTO_INCREMENT ,
        `s_name` VARCHAR(255) NOT NULL ,
        `s_room_id` INT NOT NULL ,

        INDEX (`s_room_id`),
            FOREIGN KEY (`s_room_id`)
            REFERENCES $target_db.`ROOMS`(`id`)
            ON UPDATE CASCADE
            ON DELETE CASCADE,

        PRIMARY KEY (`id`)) ENGINE = InnoDB;
     ";
    echo "<p>".mysqli_query($conn, $query). "<- Table SENSORS status</p>";
    //
    $query = "CREATE TABLE IF NOT EXISTS $target_db.`OU` 
    (
        `id` INT NOT NULL AUTO_INCREMENT ,
        `ou_name` VARCHAR(255) NOT NULL ,
        `ou_master` INT NOT NULL ,

        INDEX (`ou_master`),
            FOREIGN KEY (`ou_master`)
            REFERENCES $target_db.`OU`(`id`)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
         PRIMARY KEY (`id`)) ENGINE = InnoDB; 
    ";
    echo "<p>".mysqli_query($conn, $query). "<- Table OU status</p>"; 
    //
    $query = "CREATE TABLE IF NOT EXISTS $target_db.`TEAMS` 
    (
        `id` INT NOT NULL AUTO_INCREMENT ,
        `t_name` VARCHAR(255) NOT NULL ,
        `t_ou_id` INT NOT NULL DEFAULT 1,

        INDEX (`t_ou_id`),
            FOREIGN KEY (`t_ou_id`)
            REFERENCES $target_db.`OU`(`id`)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
         PRIMARY KEY (`id`)) ENGINE = InnoDB; 
    ";
    echo "<p>".mysqli_query($conn, $query). "<- Table TEAMS status</p>"; 
    //
    $query = "CREATE TABLE IF NOT EXISTS $target_db.`WORKERS` 
    (
        `id` INT NOT NULL AUTO_INCREMENT ,
        `w_name` VARCHAR(255) NOT NULL ,
        `w_team_id` INT NOT NULL DEFAULT 1,
        `w_ou_id` INT NOT NULL ,

        INDEX  (`w_team_id`),
            FOREIGN KEY (`w_team_id`)
            REFERENCES $target_db.`TEAMS`(`id`)
            ON UPDATE CASCADE
            ON DELETE CASCADE,

        INDEX (`w_ou_id`),
            FOREIGN KEY (`w_ou_id`)
            REFERENCES $target_db.`OU`(`id`)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
        PRIMARY KEY (`id`)) ENGINE = InnoDB; 
    ";
    echo "<p>".mysqli_query($conn, $query). "<- Table workers status</p>"; 
    //
    $query = "CREATE TABLE IF NOT EXISTS $target_db.`MEETINGS` 
    (
        `id` INT NOT NULL AUTO_INCREMENT,
        `m_name` VARCHAR(255) NOT NULL ,
        `m_start_time` INT NOT NULL DEFAULT UNIX_TIMESTAMP(),
        `m_end_time` INT NOT NULL DEFAULT DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 HOUR),
        `m_room_id` INT NOT NULL,

        INDEX (`m_room_id`),
            FOREIGN KEY (`m_room_id`)
            REFERENCES $target_db.`ROOMS`(`id`)
            ON UPDATE CASCADE
            ON DELETE CASCADE,

        PRIMARY KEY (`id`)) ENGINE = InnoDB; 
    ";
    echo "<p>".mysqli_query($conn, $query). "<- Table MEETINGS status</p>";
    //
    // `event_type` VARCHAR(5) NOT NULL default 'IN',
    $query = "CREATE TABLE IF NOT EXISTS $target_db.`SENSOR_EVENTS` 
    (
        `id` INT NOT NULL AUTO_INCREMENT ,
        `s_id` INT NOT NULL ,
        `w_id` INT NOT NULL ,
        `event_time` INT NOT NULL DEFAULT UNIX_TIMESTAMP(),
        `event_type` VARCHAR(10) NOT NULL DEFAULT 'IN',

        INDEX (`s_id`),
            FOREIGN KEY (`s_id`)
            REFERENCES $target_db.`SENSORS`(`id`)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
        
        INDEX (`w_id`),
            FOREIGN KEY (`w_id`)
            REFERENCES $target_db.`WORKERS`(`id`)
            ON UPDATE CASCADE
            ON DELETE CASCADE,

        PRIMARY KEY (`id`)) ENGINE = InnoDB;
     ";
    echo "<p>".mysqli_query($conn, $query). "<- Table SENSOR_EVENTS status</p>";
    // database created

    /*
    // fill database with some data
    echo "<p>Add data to tables</p>";
    $testpassw = "test";
    echo "<p>".mysqli_select_db($conn,$target_db)."<- Database selected</p>";
    echo "<p>".$testpassw."<- Test accounts password</p>";

    // accounts
    $query = "INSERT IGNORE INTO `workers` (`id`, `name`, `role`, `password`, `phone_number`) VALUES (1,'testworker', 'worker', '".$testpassw."',".rand(20000000,29999999).")"; 
    echo "<p>".mysqli_query($conn, $query). "<- Test worker status</p>";
    $query = "INSERT IGNORE INTO `workers` (`id`, `name`, `role`, `password`, `phone_number`) VALUES (2,'testadmin', 'admin', '".$testpassw."',".rand(20000000,29999999).")"; 
    echo "<p>".mysqli_query($conn, $query). "<- Test admin status</p>";
    $query = "INSERT IGNORE INTO `workers` (`id`, `name`, `role`, `password`, `phone_number`) VALUES (3,'testdoctor', 'doctor', '".$testpassw."',".rand(20000000,29999999).")"; 
    echo "<p>".mysqli_query($conn, $query). "<- Test doctor status</p>";

    // items INSERT INTO `items` (`id`, `name`, `cost`, `amount`) VALUES (NULL, '1', '23', '3');
    $query = "INSERT IGNORE INTO `items` (`id`, `name`, `cost`, `amount`) VALUES (1,'Cookies', 0.15,".rand(1,5000).")"; 
    mysqli_query($conn, $query);
    $query = "INSERT IGNORE INTO `items` (`id`, `name`, `cost`, `amount`,`restricted`) VALUES (2,'Medicine', 55,".rand(1,5000).",TRUE)"; 
    mysqli_query($conn, $query);
    $query = "INSERT IGNORE INTO `items` (`id`, `name`, `cost`, `amount`) VALUES (3,'Spoon', 200,".rand(1,100).")"; 
    mysqli_query($conn, $query);
    $query = "INSERT INTO `recipes`( `item_id`, `doctor_id`, `owner_name`, `amount`) VALUES ( 2, 3, 'Billy', ".rand(1,25).")";
    mysqli_query($conn, $query);
    $query = "INSERT INTO `recipes`( `item_id`, `doctor_id`, `owner_name`, `amount`,`expiration_time`) VALUES ( 2, 3, 'Willy', ".rand(1,25).",'2020-02-02')";
    mysqli_query($conn, $query);
    */
}
else{
    echo "<p> <- Connection to db failed.</p>";
}



?>
<html>
<head>
<link rel="stylesheet" href= https://localhost/md/src/style.css>
</head>
<body>
    <table>
    <tr>
        <th>Type</th> 
        <th>Test login</th>
        <th>Test password</th>
    </tr>
    <tr>
        <td>Admin</td>
        <td>testadmin</td>
        <td>test</td>
    </tr>
    <tr>
        <td>Doctor</td>
        <td>testdoctor</td>
        <td>test</td>
    </tr>
    <tr>
        <td>Worker</td>
        <td>testworker</td>
        <td>test</td>
    </tr>
    </table>
</body>

</html>

