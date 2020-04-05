CREATE TABLE `_migrations` (
  `file` varchar(45) NOT NULL,
  `executionDateTime` datetime DEFAULT current_timestamp(),
  `number` int(6) DEFAULT NULL,
  PRIMARY KEY (`file`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
