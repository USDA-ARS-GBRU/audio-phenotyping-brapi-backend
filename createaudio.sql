CREATE TABLE `audio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `audio_file_name` varchar(45) DEFAULT NULL,
  `audiomimetype` varchar(45) DEFAULT NULL,
  `audiourl` varchar(200) DEFAULT NULL,
  `time_stamp` datetime DEFAULT NULL,
  `field_id` int NOT NULL,
  `file_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='				';
