CREATE TABLE `acl` (
  `id` int(11) NOT NULL,
  `fk_user_id` int(11) DEFAULT NULL,
  `fk_media_id` int(11) DEFAULT NULL,
  `right` varchar(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_id_idx` (`fk_user_id`),
  KEY `fk_media_id_idx` (`fk_media_id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`fk_user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION,
  CONSTRAINT `fk_media_id` FOREIGN KEY (`fk_media_id`) REFERENCES `media` (`id`) ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
