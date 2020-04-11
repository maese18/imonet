CREATE TABLE `media` (
  `id` int(11) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `fileName` varchar(35) DEFAULT NULL,
  `fk_tenant_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_tenant_id_idx` (`fk_tenant_id`),
  CONSTRAINT `media_fk_tenant_id` FOREIGN KEY (`fk_tenant_id`) REFERENCES `tenant` (`id`) ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;