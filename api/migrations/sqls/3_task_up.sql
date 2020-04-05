CREATE TABLE `task` (
  `id` int(11) NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `description` varchar(45) DEFAULT NULL,
  `audio_file` varchar(60) DEFAULT NULL,
  `video_file` varchar(60) DEFAULT NULL,
  `fk_tenant_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id_idx` (`fk_tenant_id`),
  CONSTRAINT `fk_task-tenant` FOREIGN KEY (`fk_tenant_id`) REFERENCES `tenant` (`id`) ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
