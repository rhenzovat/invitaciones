
-- ----------------------------
-- Records of administracion_vendedor
-- ----------------------------

-- ----------------------------
-- Table structure for auditoria_accion
-- ----------------------------
DROP TABLE IF EXISTS `auditoria_accion`;
CREATE TABLE `auditoria_accion`  (
  `id_accion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id_accion`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of auditoria_accion
-- ----------------------------

-- ----------------------------
-- Table structure for auditoria_seguridad
-- ----------------------------
DROP TABLE IF EXISTS `auditoria_seguridad`;
CREATE TABLE `auditoria_seguridad`  (
  `id_seguridad` int NOT NULL AUTO_INCREMENT,
  `id_usuario` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `id_accion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `ip_conexion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `mac_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id_seguridad`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of auditoria_seguridad
-- ----------------------------

-- ----------------------------
-- Table structure for datatreeview
-- ----------------------------
DROP TABLE IF EXISTS `datatreeview`;
CREATE TABLE `datatreeview`  (
  `IdMenu` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `IdMenuPadre` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `id_menu` int NULL DEFAULT NULL,
  `id_menu_objetos` int NULL DEFAULT NULL,
  `IdObjeto` int NULL DEFAULT NULL,
  `Menu` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Icon` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'activefolder',
  `Icono` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Nivel` int NULL DEFAULT 0,
  `Orden` int NULL DEFAULT 0,
  `Activo` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'S',
  `selected` tinyint(1) NULL DEFAULT 0,
  `Expanded` tinyint(1) NULL DEFAULT 1,
  `IsNew` int NULL DEFAULT 0,
  `DataProtecion` int NULL DEFAULT 0,
  `Tipo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'menu',
  PRIMARY KEY (`IdMenu`) USING BTREE,
  INDEX `idx_padre`(`IdMenuPadre` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of datatreeview
-- ----------------------------
INSERT INTO `datatreeview` VALUES ('m1', NULL, NULL, NULL, NULL, 'Programacion', 'folder', NULL, 0, 0, 'S', 0, 1, 0, 0, 'modulo');
INSERT INTO `datatreeview` VALUES ('m12', 'm1', 12, NULL, NULL, NULL, 'activefolder', NULL, 1, 0, 'S', 1, 1, 0, 0, 'menu');
INSERT INTO `datatreeview` VALUES ('m13', 'm2', 13, NULL, NULL, NULL, 'activefolder', NULL, 1, 0, 'S', 1, 1, 0, 0, 'menu');
INSERT INTO `datatreeview` VALUES ('m14', 'm3', 14, NULL, NULL, NULL, 'activefolder', NULL, 1, 0, 'S', 1, 1, 0, 0, 'menu');
INSERT INTO `datatreeview` VALUES ('m15', 'm4', 15, NULL, NULL, 'Clientes', 'activefolder', NULL, 1, 0, 'S', 1, 1, 0, 0, 'menu');
INSERT INTO `datatreeview` VALUES ('m16', 'm4', 16, NULL, NULL, 'Empleados', 'activefolder', NULL, 1, 0, 'S', 1, 1, 0, 0, 'menu');
INSERT INTO `datatreeview` VALUES ('m17', 'm4', 17, NULL, NULL, 'Vendedor', 'activefolder', NULL, 1, 0, 'S', 1, 1, 0, 0, 'menu');
INSERT INTO `datatreeview` VALUES ('m18', 'm4', 18, NULL, NULL, 'Unidad de Medida', 'activefolder', NULL, 1, 0, 'S', 1, 1, 0, 0, 'menu');
INSERT INTO `datatreeview` VALUES ('m19', 'm4', 19, NULL, NULL, 'Tipo de Bomba', 'activefolder', NULL, 1, 0, 'S', 1, 1, 0, 0, 'menu');
INSERT INTO `datatreeview` VALUES ('m2', NULL, NULL, NULL, NULL, 'Carguios', 'folder', NULL, 0, 0, 'S', 0, 1, 0, 0, 'modulo');
INSERT INTO `datatreeview` VALUES ('m20', 'm5', 20, NULL, NULL, 'Usuarios', 'activefolder', NULL, 1, 0, 'S', 1, 1, 0, 0, 'menu');
INSERT INTO `datatreeview` VALUES ('m21', 'm5', 21, NULL, NULL, 'Perfil', 'activefolder', NULL, 1, 0, 'S', 1, 1, 0, 0, 'menu');
INSERT INTO `datatreeview` VALUES ('m22', 'm5', 22, NULL, NULL, 'Roles', 'activefolder', NULL, 1, 0, 'S', 1, 1, 0, 0, 'menu');
INSERT INTO `datatreeview` VALUES ('m3', NULL, NULL, NULL, NULL, 'Diseños', 'folder', NULL, 0, 0, 'S', 0, 1, 0, 0, 'modulo');
INSERT INTO `datatreeview` VALUES ('m4', NULL, NULL, NULL, NULL, 'Administracion', 'folder', NULL, 0, 0, 'S', 0, 1, 0, 0, 'modulo');
INSERT INTO `datatreeview` VALUES ('m5', NULL, NULL, NULL, NULL, 'Seguridad', 'folder', NULL, 0, 0, 'S', 0, 1, 0, 0, 'modulo');
INSERT INTO `datatreeview` VALUES ('o1', 'm12', 12, 1, 23, 'EDITAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o10', 'm12', 12, 10, 32, 'AGREGAR PERMISO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o100', 'm21', 21, 100, 23, 'EDITAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o101', 'm21', 21, 101, 24, 'ELIMINAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o102', 'm21', 21, 102, 25, 'BUSCAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o103', 'm21', 21, 103, 26, 'EXPORTAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o104', 'm21', 21, 104, 27, 'ACTUALIZAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o105', 'm21', 21, 105, 28, 'CREAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o106', 'm21', 21, 106, 29, 'AGREGAR MATERIAL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o107', 'm21', 21, 107, 30, 'AGREGAR PERFIL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o108', 'm21', 21, 108, 31, 'AGREGAR ROL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o109', 'm21', 21, 109, 32, 'AGREGAR PERMISO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o11', 'm12', 12, 11, 33, 'LINK CARGUIO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o110', 'm21', 21, 110, 33, 'LINK CARGUIO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o111', 'm22', 22, 111, 23, 'EDITAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o112', 'm22', 22, 112, 24, 'ELIMINAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o113', 'm22', 22, 113, 25, 'BUSCAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o114', 'm22', 22, 114, 26, 'EXPORTAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o115', 'm22', 22, 115, 27, 'ACTUALIZAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o116', 'm22', 22, 116, 28, 'CREAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o117', 'm22', 22, 117, 29, 'AGREGAR MATERIAL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o118', 'm22', 22, 118, 30, 'AGREGAR PERFIL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o119', 'm22', 22, 119, 31, 'AGREGAR ROL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o12', 'm13', 13, 12, 23, 'EDITAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o120', 'm22', 22, 120, 32, 'AGREGAR PERMISO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o121', 'm22', 22, 121, 33, 'LINK CARGUIO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o13', 'm13', 13, 13, 24, 'ELIMINAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o14', 'm13', 13, 14, 25, 'BUSCAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o15', 'm13', 13, 15, 26, 'EXPORTAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o16', 'm13', 13, 16, 27, 'ACTUALIZAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o17', 'm13', 13, 17, 28, 'CREAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o18', 'm13', 13, 18, 29, 'AGREGAR MATERIAL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o19', 'm13', 13, 19, 30, 'AGREGAR PERFIL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o2', 'm12', 12, 2, 24, 'ELIMINAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o20', 'm13', 13, 20, 31, 'AGREGAR ROL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o21', 'm13', 13, 21, 32, 'AGREGAR PERMISO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o22', 'm13', 13, 22, 33, 'LINK CARGUIO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o23', 'm14', 14, 23, 23, 'EDITAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o24', 'm14', 14, 24, 24, 'ELIMINAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o25', 'm14', 14, 25, 25, 'BUSCAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o26', 'm14', 14, 26, 26, 'EXPORTAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o27', 'm14', 14, 27, 27, 'ACTUALIZAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o28', 'm14', 14, 28, 28, 'CREAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o29', 'm14', 14, 29, 29, 'AGREGAR MATERIAL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o3', 'm12', 12, 3, 25, 'BUSCAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o30', 'm14', 14, 30, 30, 'AGREGAR PERFIL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o31', 'm14', 14, 31, 31, 'AGREGAR ROL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o32', 'm14', 14, 32, 32, 'AGREGAR PERMISO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o33', 'm14', 14, 33, 33, 'LINK CARGUIO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o34', 'm15', 15, 34, 23, 'EDITAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o35', 'm15', 15, 35, 24, 'ELIMINAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o36', 'm15', 15, 36, 25, 'BUSCAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o37', 'm15', 15, 37, 26, 'EXPORTAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o38', 'm15', 15, 38, 27, 'ACTUALIZAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o39', 'm15', 15, 39, 28, 'CREAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o4', 'm12', 12, 4, 26, 'EXPORTAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o40', 'm15', 15, 40, 29, 'AGREGAR MATERIAL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o41', 'm15', 15, 41, 30, 'AGREGAR PERFIL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o42', 'm15', 15, 42, 31, 'AGREGAR ROL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o43', 'm15', 15, 43, 32, 'AGREGAR PERMISO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o44', 'm15', 15, 44, 33, 'LINK CARGUIO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o45', 'm16', 16, 45, 23, 'EDITAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o46', 'm16', 16, 46, 24, 'ELIMINAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o47', 'm16', 16, 47, 25, 'BUSCAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o48', 'm16', 16, 48, 26, 'EXPORTAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o49', 'm16', 16, 49, 27, 'ACTUALIZAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o5', 'm12', 12, 5, 27, 'ACTUALIZAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o50', 'm16', 16, 50, 28, 'CREAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o51', 'm16', 16, 51, 29, 'AGREGAR MATERIAL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o52', 'm16', 16, 52, 30, 'AGREGAR PERFIL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o53', 'm16', 16, 53, 31, 'AGREGAR ROL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o54', 'm16', 16, 54, 32, 'AGREGAR PERMISO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o55', 'm16', 16, 55, 33, 'LINK CARGUIO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o56', 'm17', 17, 56, 23, 'EDITAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o57', 'm17', 17, 57, 24, 'ELIMINAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o58', 'm17', 17, 58, 25, 'BUSCAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o59', 'm17', 17, 59, 26, 'EXPORTAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o6', 'm12', 12, 6, 28, 'CREAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o60', 'm17', 17, 60, 27, 'ACTUALIZAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o61', 'm17', 17, 61, 28, 'CREAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o62', 'm17', 17, 62, 29, 'AGREGAR MATERIAL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o63', 'm17', 17, 63, 30, 'AGREGAR PERFIL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o64', 'm17', 17, 64, 31, 'AGREGAR ROL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o65', 'm17', 17, 65, 32, 'AGREGAR PERMISO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o66', 'm17', 17, 66, 33, 'LINK CARGUIO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o67', 'm18', 18, 67, 23, 'EDITAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o68', 'm18', 18, 68, 24, 'ELIMINAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o69', 'm18', 18, 69, 25, 'BUSCAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o7', 'm12', 12, 7, 29, 'AGREGAR MATERIAL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o70', 'm18', 18, 70, 26, 'EXPORTAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o71', 'm18', 18, 71, 27, 'ACTUALIZAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o72', 'm18', 18, 72, 28, 'CREAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o73', 'm18', 18, 73, 29, 'AGREGAR MATERIAL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o74', 'm18', 18, 74, 30, 'AGREGAR PERFIL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o75', 'm18', 18, 75, 31, 'AGREGAR ROL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o76', 'm18', 18, 76, 32, 'AGREGAR PERMISO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o77', 'm18', 18, 77, 33, 'LINK CARGUIO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o78', 'm19', 19, 78, 23, 'EDITAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o79', 'm19', 19, 79, 24, 'ELIMINAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o8', 'm12', 12, 8, 30, 'AGREGAR PERFIL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o80', 'm19', 19, 80, 25, 'BUSCAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o81', 'm19', 19, 81, 26, 'EXPORTAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o82', 'm19', 19, 82, 27, 'ACTUALIZAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o83', 'm19', 19, 83, 28, 'CREAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o84', 'm19', 19, 84, 29, 'AGREGAR MATERIAL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o85', 'm19', 19, 85, 30, 'AGREGAR PERFIL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o86', 'm19', 19, 86, 31, 'AGREGAR ROL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o87', 'm19', 19, 87, 32, 'AGREGAR PERMISO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o88', 'm19', 19, 88, 33, 'LINK CARGUIO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o89', 'm20', 20, 89, 23, 'EDITAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o9', 'm12', 12, 9, 31, 'AGREGAR ROL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o90', 'm20', 20, 90, 24, 'ELIMINAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o91', 'm20', 20, 91, 25, 'BUSCAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o92', 'm20', 20, 92, 26, 'EXPORTAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o93', 'm20', 20, 93, 27, 'ACTUALIZAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o94', 'm20', 20, 94, 28, 'CREAR', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o95', 'm20', 20, 95, 29, 'AGREGAR MATERIAL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o96', 'm20', 20, 96, 30, 'AGREGAR PERFIL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o97', 'm20', 20, 97, 31, 'AGREGAR ROL', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o98', 'm20', 20, 98, 32, 'AGREGAR PERMISO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
INSERT INTO `datatreeview` VALUES ('o99', 'm20', 20, 99, 33, 'LINK CARGUIO', 'bullet', NULL, 2, 0, 'S', 0, 0, 0, 0, 'objeto');
--------------------
-- Table structure for password_reset_tokens
-- ----------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens`  (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of password_reset_tokens
-- ----------------------------
INSERT INTO `password_reset_tokens` VALUES ('ghiovani666@gmail.com', '$2y$12$jc4dvuPm21Z4geaMqHedReWORhBs38svQmmZfwYXL07l0026UBg22', '2025-04-30 09:11:23');

-- ----------------------------
-- Table structure for password_resets
-- ----------------------------
DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE `password_resets`  (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  INDEX `password_resets_email_index`(`email` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of password_resets
-- ----------------------------

-- ----------------------------
-- Table structure for personal_access_tokens
-- ----------------------------
DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `personal_access_tokens_token_unique`(`token` ASC) USING BTREE,
  INDEX `personal_access_tokens_tokenable_type_tokenable_id_index`(`tokenable_type` ASC, `tokenable_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of personal_access_tokens
-- ----------------------------

-- ----------------------------
-- Table structure for refresh_tokens
-- ----------------------------
DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `refresh_tokens_token_unique`(`token` ASC) USING BTREE,
  INDEX `refresh_tokens_user_id_foreign`(`user_id` ASC) USING BTREE,
  INDEX `refresh_tokens_expires_at_index`(`expires_at` ASC) USING BTREE,
  CONSTRAINT `refresh_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 197 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of refresh_tokens
-- ----------------------------
INSERT INTO `refresh_tokens` VALUES (1, 1, '5c7f1be9-3111-4839-bcdb-2a9d41197955', '2025-10-22 22:25:55', '2025-09-22 22:25:55', '2025-09-22 22:25:55');
INSERT INTO `refresh_tokens` VALUES (2, 1, 'cb2b14d7-a7c4-4d85-b1b1-a5035987d5c7', '2025-10-23 02:29:32', '2025-09-23 02:29:32', '2025-09-23 02:29:32');
INSERT INTO `refresh_tokens` VALUES (3, 1, 'c52bc2b5-1f64-4afc-9bd7-1948c8a042b8', '2025-10-30 15:31:14', '2025-09-30 15:31:14', '2025-09-30 15:31:14');
INSERT INTO `refresh_tokens` VALUES (4, 1, 'e622898c-2032-4138-8dd0-8013fed3c724', '2025-10-30 15:34:02', '2025-09-30 15:34:02', '2025-09-30 15:34:02');
INSERT INTO `refresh_tokens` VALUES (5, 1, '5bd86dc1-e63d-47f4-af46-2400727e7c29', '2025-10-31 04:27:31', '2025-10-01 04:27:31', '2025-10-01 04:27:31');
INSERT INTO `refresh_tokens` VALUES (6, 1, '36a9c90a-24d4-4a2d-b5fd-be895b75c76b', '2025-10-31 08:04:58', '2025-10-01 08:04:58', '2025-10-01 08:04:58');
INSERT INTO `refresh_tokens` VALUES (7, 1, '5ec882bb-80bf-48ca-94e8-46c70762e641', '2025-10-31 09:04:41', '2025-10-01 09:04:41', '2025-10-01 09:04:41');
INSERT INTO `refresh_tokens` VALUES (8, 1, 'fa1aa351-4561-490a-b094-24b4eab6b27b', '2025-10-31 09:25:46', '2025-10-01 09:25:46', '2025-10-01 09:25:46');
INSERT INTO `refresh_tokens` VALUES (9, 1, '6fa61b1f-7a25-4d8e-99e4-f9312963f5e8', '2025-10-31 14:20:33', '2025-10-01 14:20:33', '2025-10-01 14:20:33');
INSERT INTO `refresh_tokens` VALUES (10, 1, 'd1b81a12-1ddc-40dc-97af-232c3c28944d', '2025-10-31 15:24:10', '2025-10-01 15:24:10', '2025-10-01 15:24:10');
INSERT INTO `refresh_tokens` VALUES (11, 1, '96f74d29-b34a-40cb-94a9-955b0a7f3087', '2025-11-01 09:08:53', '2025-10-02 09:08:53', '2025-10-02 09:08:53');
INSERT INTO `refresh_tokens` VALUES (12, 1, 'bfe56e14-349b-4017-a551-f5ff1d7456db', '2025-11-01 12:38:18', '2025-10-02 12:38:18', '2025-10-02 12:38:18');
INSERT INTO `refresh_tokens` VALUES (13, 1, '51c011d3-52ac-46d9-9d8a-4e836aede167', '2025-11-01 14:05:15', '2025-10-02 14:05:15', '2025-10-02 14:05:15');
INSERT INTO `refresh_tokens` VALUES (14, 1, '017e5dfa-697b-47ec-94c2-7efdf8b5646a', '2025-11-02 10:55:20', '2025-10-03 10:55:20', '2025-10-03 10:55:20');
INSERT INTO `refresh_tokens` VALUES (15, 1, 'e008da72-b3f8-414a-8de1-5adc10b5c854', '2025-11-03 09:01:38', '2025-10-04 09:01:38', '2025-10-04 09:01:38');
INSERT INTO `refresh_tokens` VALUES (16, 1, '6d762b75-047d-4147-a164-cea003d31065', '2025-11-05 09:53:16', '2025-10-06 09:53:16', '2025-10-06 09:53:16');
INSERT INTO `refresh_tokens` VALUES (17, 1, 'eea152f3-0e40-46da-b2a5-675f5193ca3a', '2025-11-05 09:54:26', '2025-10-06 09:54:26', '2025-10-06 09:54:26');
INSERT INTO `refresh_tokens` VALUES (18, 1, '4d0f8ce2-da8b-4b0d-b147-077a6d9a57bf', '2025-11-05 20:50:58', '2025-10-06 20:50:58', '2025-10-06 20:50:58');
INSERT INTO `refresh_tokens` VALUES (19, 1, '607d4056-d545-4d23-a14d-8daa61492210', '2025-11-06 04:41:35', '2025-10-07 04:41:35', '2025-10-07 04:41:35');
INSERT INTO `refresh_tokens` VALUES (20, 1, 'ee82ea9b-87f4-4a3b-a5a8-464019ea7636', '2025-11-06 04:42:22', '2025-10-07 04:42:22', '2025-10-07 04:42:22');
INSERT INTO `refresh_tokens` VALUES (21, 1, '84c2d350-de92-4bc8-b4bb-82245ed3aebe', '2025-11-06 10:23:31', '2025-10-07 10:23:31', '2025-10-07 10:23:31');
INSERT INTO `refresh_tokens` VALUES (22, 1, 'a61b2018-3bf4-41ea-9b83-c4266f86af27', '2025-11-06 11:05:17', '2025-10-07 11:05:17', '2025-10-07 11:05:17');
INSERT INTO `refresh_tokens` VALUES (23, 1, '07cc871c-8528-4b3a-aa8a-548a615150c9', '2025-11-06 11:38:52', '2025-10-07 11:38:52', '2025-10-07 11:38:52');
INSERT INTO `refresh_tokens` VALUES (24, 1, '736b656a-c19a-4e60-880c-1456495821ca', '2025-11-06 14:20:50', '2025-10-07 14:20:50', '2025-10-07 14:20:50');
INSERT INTO `refresh_tokens` VALUES (25, 1, '1082e20c-d9b7-4ff7-aef2-6ff7ef4d5499', '2025-11-07 10:00:56', '2025-10-08 10:00:56', '2025-10-08 10:00:56');
INSERT INTO `refresh_tokens` VALUES (26, 1, 'ac510af3-46cc-40d9-8dca-1d32c568462f', '2025-11-08 09:44:41', '2025-10-09 09:44:41', '2025-10-09 09:44:41');
INSERT INTO `refresh_tokens` VALUES (27, 1, '966e6696-e0bd-4322-9da4-044091ae80fb', '2025-11-12 08:09:40', '2025-10-13 08:09:40', '2025-10-13 08:09:40');
INSERT INTO `refresh_tokens` VALUES (28, 1, '3968db89-2f23-4b5d-b6b2-c3b92f98fd6c', '2025-11-12 12:14:56', '2025-10-13 12:14:56', '2025-10-13 12:14:56');
INSERT INTO `refresh_tokens` VALUES (29, 1, 'd71f0b2a-f293-4999-9ad3-a333995454e2', '2025-11-14 09:07:41', '2025-10-15 09:07:41', '2025-10-15 09:07:41');
INSERT INTO `refresh_tokens` VALUES (30, 1, '0bdf38a0-7af6-4bd4-a399-47316bf8add5', '2025-11-14 12:21:17', '2025-10-15 12:21:17', '2025-10-15 12:21:17');
INSERT INTO `refresh_tokens` VALUES (31, 1, 'efcd7200-283a-4205-b569-aeab2a917d9d', '2025-11-15 11:56:59', '2025-10-16 11:56:59', '2025-10-16 11:56:59');
INSERT INTO `refresh_tokens` VALUES (32, 1, 'e0b61cad-150c-4d10-aa04-d4a290aa8018', '2025-11-18 05:36:47', '2025-10-19 05:36:47', '2025-10-19 05:36:47');
INSERT INTO `refresh_tokens` VALUES (33, 1, '8f4b3ad1-2183-4eb1-88c7-5261868066a8', '2025-11-18 05:46:55', '2025-10-19 05:46:55', '2025-10-19 05:46:55');
INSERT INTO `refresh_tokens` VALUES (34, 1, '04907e11-baa6-43e7-bf27-c81044b64538', '2025-11-19 08:19:22', '2025-10-20 08:19:22', '2025-10-20 08:19:22');
INSERT INTO `refresh_tokens` VALUES (35, 1, '0310758f-f7d4-41c7-88b7-95e3ef758132', '2025-11-19 12:01:19', '2025-10-20 12:01:19', '2025-10-20 12:01:19');
INSERT INTO `refresh_tokens` VALUES (36, 1, 'c9d57e37-f306-455d-b26b-16b1ee8a7ee4', '2025-11-19 19:49:48', '2025-10-20 19:49:48', '2025-10-20 19:49:48');
INSERT INTO `refresh_tokens` VALUES (37, 1, '6ba7b3c0-70de-432a-ab6e-916b3ec190ee', '2025-11-19 19:50:00', '2025-10-20 19:50:00', '2025-10-20 19:50:00');
INSERT INTO `refresh_tokens` VALUES (38, 1, '1fa1f09f-c659-4404-b5e2-341db689b2e4', '2025-11-19 19:56:45', '2025-10-20 19:56:45', '2025-10-20 19:56:45');
INSERT INTO `refresh_tokens` VALUES (39, 1, 'ec79ec1a-625c-4f31-994e-e4fb6acde71d', '2025-11-19 21:36:11', '2025-10-20 21:36:11', '2025-10-20 21:36:11');
INSERT INTO `refresh_tokens` VALUES (40, 1, '5226d6e9-1546-475f-ba3e-b71edfca69c1', '2025-11-19 22:29:27', '2025-10-20 22:29:27', '2025-10-20 22:29:27');
INSERT INTO `refresh_tokens` VALUES (41, 1, '4022f910-d9f5-4047-9f14-664ca298203d', '2025-11-23 09:44:28', '2025-10-24 09:44:28', '2025-10-24 09:44:28');
INSERT INTO `refresh_tokens` VALUES (42, 1, '0f0b3f8e-923a-411a-ac87-ff37aded462b', '2025-11-26 08:30:34', '2025-10-27 08:30:34', '2025-10-27 08:30:34');
INSERT INTO `refresh_tokens` VALUES (43, 1, 'edb117e2-56b2-424f-a681-eb5163db6485', '2025-11-27 11:56:04', '2025-10-28 11:56:04', '2025-10-28 11:56:04');
INSERT INTO `refresh_tokens` VALUES (44, 1, 'e0f4de47-4f59-4a06-b6ce-27bb230b6a2e', '2025-11-28 10:09:22', '2025-10-29 10:09:22', '2025-10-29 10:09:22');
INSERT INTO `refresh_tokens` VALUES (45, 1, '64be4243-7a55-4686-924a-ddbcca4c3be8', '2025-11-29 09:24:42', '2025-10-30 09:24:42', '2025-10-30 09:24:42');
INSERT INTO `refresh_tokens` VALUES (46, 1, '0419286f-7723-4a23-a7db-63152955324a', '2025-11-29 22:58:38', '2025-10-30 22:58:38', '2025-10-30 22:58:38');
INSERT INTO `refresh_tokens` VALUES (47, 1, 'c8be1f86-2358-4df4-8368-419cf9f14de5', '2025-12-01 00:59:41', '2025-11-01 00:59:41', '2025-11-01 00:59:41');
INSERT INTO `refresh_tokens` VALUES (48, 1, '2a8f6670-8066-4636-9fea-a54b35961396', '2025-12-02 23:10:25', '2025-11-02 23:10:25', '2025-11-02 23:10:25');
INSERT INTO `refresh_tokens` VALUES (49, 1, '707967d5-3f14-4419-8260-4539e2508d58', '2025-12-02 23:12:32', '2025-11-02 23:12:32', '2025-11-02 23:12:32');
INSERT INTO `refresh_tokens` VALUES (50, 1, '7589e9b9-5eb2-42e5-88da-4ba839e800ec', '2025-12-07 08:34:38', '2025-11-07 08:34:38', '2025-11-07 08:34:38');
INSERT INTO `refresh_tokens` VALUES (51, 1, '28a6c30c-5e50-46e6-9d2d-bee177636cb8', '2025-12-10 08:45:37', '2025-11-10 08:45:37', '2025-11-10 08:45:37');
INSERT INTO `refresh_tokens` VALUES (52, 1, '35c635aa-364d-4054-99d3-dc483e687aa9', '2025-12-12 09:51:29', '2025-11-12 09:51:29', '2025-11-12 09:51:29');
INSERT INTO `refresh_tokens` VALUES (53, 1, '40094ad6-a0c3-4c3f-a083-7e2d38ad70aa', '2025-12-13 10:29:54', '2025-11-13 10:29:54', '2025-11-13 10:29:54');
INSERT INTO `refresh_tokens` VALUES (54, 1, '36f2349f-eed4-4403-b4ca-cac957725b27', '2025-12-13 10:37:06', '2025-11-13 10:37:06', '2025-11-13 10:37:06');
INSERT INTO `refresh_tokens` VALUES (55, 1, 'd119c885-f197-4182-ad71-1b65896d5df9', '2025-12-14 10:05:54', '2025-11-14 10:05:54', '2025-11-14 10:05:54');
INSERT INTO `refresh_tokens` VALUES (56, 1, 'b22f9a5f-8908-44cc-ae43-f469359fb81a', '2025-12-14 20:23:41', '2025-11-14 20:23:41', '2025-11-14 20:23:41');
INSERT INTO `refresh_tokens` VALUES (57, 1, '3f28075f-3342-4a1e-a5ab-aaeae61f1138', '2025-12-14 21:33:20', '2025-11-14 21:33:20', '2025-11-14 21:33:20');
INSERT INTO `refresh_tokens` VALUES (58, 1, '6cd01b3b-69f5-4e21-9c6b-e38feacf7180', '2025-12-16 20:44:36', '2025-11-16 20:44:36', '2025-11-16 20:44:36');
INSERT INTO `refresh_tokens` VALUES (59, 1, 'a6d5d63d-95e5-4997-a973-910c53bbee8b', '2025-12-16 21:45:04', '2025-11-16 21:45:04', '2025-11-16 21:45:04');
INSERT INTO `refresh_tokens` VALUES (60, 1, 'db84d7ed-4609-47dc-9436-0e044b1bad89', '2025-12-16 22:45:12', '2025-11-16 22:45:12', '2025-11-16 22:45:12');
INSERT INTO `refresh_tokens` VALUES (61, 1, 'c5a83902-1e8e-41c9-a280-807f85334c80', '2025-12-17 10:00:15', '2025-11-17 10:00:15', '2025-11-17 10:00:15');
INSERT INTO `refresh_tokens` VALUES (62, 1, 'b47fb498-1720-4748-a69b-03b2551a099e', '2025-12-19 08:24:32', '2025-11-19 08:24:32', '2025-11-19 08:24:32');
INSERT INTO `refresh_tokens` VALUES (63, 1, 'ae80f37d-c804-4fe0-8165-cf5ff7b254d0', '2025-12-21 00:24:02', '2025-11-21 00:24:02', '2025-11-21 00:24:02');
INSERT INTO `refresh_tokens` VALUES (64, 1, 'a2a83e89-fff1-4867-8e94-4b4e0ffa7a14', '2025-12-21 09:01:09', '2025-11-21 09:01:09', '2025-11-21 09:01:09');
INSERT INTO `refresh_tokens` VALUES (65, 1, '08cc0acb-1b21-4ab4-8c48-5be896597591', '2025-12-21 10:18:34', '2025-11-21 10:18:34', '2025-11-21 10:18:34');
INSERT INTO `refresh_tokens` VALUES (66, 1, 'a96b50f6-2d9a-41ab-a08e-d51bd85fc4be', '2025-12-22 09:41:26', '2025-11-22 09:41:26', '2025-11-22 09:41:26');
INSERT INTO `refresh_tokens` VALUES (67, 1, '3f79f284-ea08-4952-a8b6-10de5a618cfd', '2025-12-22 12:09:16', '2025-11-22 12:09:16', '2025-11-22 12:09:16');
INSERT INTO `refresh_tokens` VALUES (68, 1, '45a00e20-9ee0-4eab-a16b-4bf11547b956', '2025-12-25 11:11:29', '2025-11-25 11:11:29', '2025-11-25 11:11:29');
INSERT INTO `refresh_tokens` VALUES (69, 1, '77f8e4dc-7b50-4dda-9358-f7f494bc16f0', '2025-12-26 03:41:48', '2025-11-26 03:41:48', '2025-11-26 03:41:48');
INSERT INTO `refresh_tokens` VALUES (70, 1, 'e5e8c08a-609b-455a-939f-c341bc7a0ee3', '2025-12-26 10:10:42', '2025-11-26 10:10:42', '2025-11-26 10:10:42');
INSERT INTO `refresh_tokens` VALUES (71, 1, 'd9dc3a10-3021-48cc-9701-431d4ec035ee', '2025-12-26 10:58:38', '2025-11-26 10:58:38', '2025-11-26 10:58:38');
INSERT INTO `refresh_tokens` VALUES (72, 1, 'a3cbd673-08a8-48f9-adf6-4d8e0601fe88', '2025-12-27 08:12:18', '2025-11-27 08:12:18', '2025-11-27 08:12:18');
INSERT INTO `refresh_tokens` VALUES (73, 1, 'b23cfa44-84bb-4596-bdfd-009162773288', '2025-12-29 08:01:39', '2025-11-29 08:01:39', '2025-11-29 08:01:39');
INSERT INTO `refresh_tokens` VALUES (74, 1, '585483eb-bb30-44e9-9744-92bca9274106', '2025-12-29 11:00:26', '2025-11-29 11:00:26', '2025-11-29 11:00:26');
INSERT INTO `refresh_tokens` VALUES (75, 1, 'a8bf9a82-e55d-494a-a8da-6c8ec1e867b7', '2025-12-30 13:06:12', '2025-11-30 13:06:12', '2025-11-30 13:06:12');
INSERT INTO `refresh_tokens` VALUES (76, 1, '7cb8a7e6-a72d-49e5-aaa5-01e7d1e53117', '2025-12-30 21:40:06', '2025-11-30 21:40:06', '2025-11-30 21:40:06');
INSERT INTO `refresh_tokens` VALUES (77, 1, '152db303-c76d-45ac-8d70-2051044d8ab7', '2025-12-31 08:14:05', '2025-12-01 08:14:05', '2025-12-01 08:14:05');
INSERT INTO `refresh_tokens` VALUES (78, 1, 'bee58f02-ee30-493e-99da-7efb81a4e0b4', '2025-12-31 11:13:14', '2025-12-01 11:13:14', '2025-12-01 11:13:14');
INSERT INTO `refresh_tokens` VALUES (79, 1, '20a62a60-49f5-405f-991c-d608b334fbc1', '2025-12-31 12:15:13', '2025-12-01 12:15:13', '2025-12-01 12:15:13');
INSERT INTO `refresh_tokens` VALUES (80, 1, '6a845433-6129-4c72-8e71-f391f776689e', '2025-12-31 12:29:59', '2025-12-01 12:29:59', '2025-12-01 12:29:59');
INSERT INTO `refresh_tokens` VALUES (81, 1, '58ea3444-515b-42e9-8e15-239d9c0cca4d', '2025-12-31 12:32:40', '2025-12-01 12:32:40', '2025-12-01 12:32:40');
INSERT INTO `refresh_tokens` VALUES (82, 1, '5b9ecdf8-2bd3-4a2c-90fc-4795f4357257', '2025-12-31 12:44:49', '2025-12-01 12:44:49', '2025-12-01 12:44:49');
INSERT INTO `refresh_tokens` VALUES (83, 1, 'a222e537-94b1-45b8-b399-5516f7a6ad79', '2025-12-31 15:33:36', '2025-12-01 15:33:36', '2025-12-01 15:33:36');
INSERT INTO `refresh_tokens` VALUES (84, 1, 'c3160ddb-6fe0-4869-bd7e-3fa208e2060e', '2025-12-31 20:31:20', '2025-12-01 20:31:20', '2025-12-01 20:31:20');
INSERT INTO `refresh_tokens` VALUES (85, 1, 'c23453ea-99fb-4485-9032-961ec9b9bf3f', '2025-12-31 21:35:07', '2025-12-01 21:35:07', '2025-12-01 21:35:07');
INSERT INTO `refresh_tokens` VALUES (86, 1, '26a62c83-5486-405c-9e1e-416df0b275b4', '2025-12-31 22:35:31', '2025-12-01 22:35:31', '2025-12-01 22:35:31');
INSERT INTO `refresh_tokens` VALUES (87, 1, 'fdff0e72-e417-4a32-8309-0f0a0ee95693', '2025-12-31 23:27:29', '2025-12-01 23:27:29', '2025-12-01 23:27:29');
INSERT INTO `refresh_tokens` VALUES (88, 1, '116727a3-7631-46ac-9d79-e19985191fbb', '2026-01-01 08:00:01', '2025-12-02 08:00:01', '2025-12-02 08:00:01');
INSERT INTO `refresh_tokens` VALUES (89, 1, '3da6f393-47b2-470f-94dd-59e9b394edbd', '2026-01-01 08:06:25', '2025-12-02 08:06:25', '2025-12-02 08:06:25');
INSERT INTO `refresh_tokens` VALUES (90, 1, '3460757d-ab64-4b52-9df2-428bc55e6e44', '2026-01-02 11:46:50', '2025-12-03 11:46:50', '2025-12-03 11:46:50');
INSERT INTO `refresh_tokens` VALUES (91, 1, 'ba43a4ee-c752-4970-be5a-8d8d250865fb', '2026-01-02 12:28:53', '2025-12-03 12:28:53', '2025-12-03 12:28:53');
INSERT INTO `refresh_tokens` VALUES (92, 1, '162bc3ba-68be-4fbf-b0d9-154cec09f894', '2026-01-02 16:12:34', '2025-12-03 16:12:34', '2025-12-03 16:12:34');
INSERT INTO `refresh_tokens` VALUES (93, 1, '1e27f32a-9035-415c-bf74-ca2edecf2d1f', '2026-01-03 08:33:43', '2025-12-04 08:33:43', '2025-12-04 08:33:43');
INSERT INTO `refresh_tokens` VALUES (94, 1, '84ca0b68-6e8e-4b80-bfb4-1d2c82e25da8', '2026-01-05 08:46:30', '2025-12-06 08:46:30', '2025-12-06 08:46:30');
INSERT INTO `refresh_tokens` VALUES (95, 1, '6546fc07-b61e-4d2b-83e0-59f9b16bc25c', '2026-01-06 10:10:56', '2025-12-07 10:10:56', '2025-12-07 10:10:56');
INSERT INTO `refresh_tokens` VALUES (96, 1, '8d9e0513-8cfc-4b0a-925d-f1086da2222a', '2026-01-09 09:17:06', '2025-12-10 09:17:06', '2025-12-10 09:17:06');
INSERT INTO `refresh_tokens` VALUES (97, 1, 'e039e002-9078-42eb-9726-e8c944a5a1ff', '2026-01-09 09:22:17', '2025-12-10 09:22:17', '2025-12-10 09:22:17');
INSERT INTO `refresh_tokens` VALUES (98, 1, 'de2e8088-94c9-4553-a6d4-bc82e79d067c', '2026-01-09 09:22:45', '2025-12-10 09:22:45', '2025-12-10 09:22:45');
INSERT INTO `refresh_tokens` VALUES (99, 1, '768cc06b-5edb-4eaf-8e40-161d93dd852e', '2026-01-09 10:47:27', '2025-12-10 10:47:27', '2025-12-10 10:47:27');
INSERT INTO `refresh_tokens` VALUES (100, 1, '020ab1fa-5dd7-47d1-ae40-a3ce5968384e', '2026-01-09 11:58:45', '2025-12-10 11:58:45', '2025-12-10 11:58:45');
INSERT INTO `refresh_tokens` VALUES (101, 1, '07510028-b510-4740-b94e-bc9fb8ce1e6a', '2026-01-09 15:27:41', '2025-12-10 15:27:41', '2025-12-10 15:27:41');
INSERT INTO `refresh_tokens` VALUES (102, 1, 'c9eca924-f9de-4768-a527-d0e78e9e360f', '2026-01-09 15:53:21', '2025-12-10 15:53:21', '2025-12-10 15:53:21');
INSERT INTO `refresh_tokens` VALUES (103, 1, 'ae8d2358-0c82-4417-9662-099bd7206a16', '2026-01-09 16:10:57', '2025-12-10 16:10:57', '2025-12-10 16:10:57');
INSERT INTO `refresh_tokens` VALUES (104, 1, 'd9030ca1-8720-4be5-92af-06a7dfb2d140', '2026-01-09 16:35:56', '2025-12-10 16:35:56', '2025-12-10 16:35:56');
INSERT INTO `refresh_tokens` VALUES (105, 1, 'c52ad3f7-512c-4dd7-82cf-208d6e31dfe2', '2026-01-09 20:04:53', '2025-12-10 20:04:53', '2025-12-10 20:04:53');
INSERT INTO `refresh_tokens` VALUES (106, 1, '4b4e062f-77e0-4c4c-982f-49cdf885620d', '2026-01-09 21:29:20', '2025-12-10 21:29:20', '2025-12-10 21:29:20');
INSERT INTO `refresh_tokens` VALUES (107, 1, '77767487-98af-47f3-b905-ec9c73498ab0', '2026-01-09 21:52:12', '2025-12-10 21:52:12', '2025-12-10 21:52:12');
INSERT INTO `refresh_tokens` VALUES (108, 1, 'fbb0321c-efc3-4530-994d-831841d9b4e3', '2026-01-09 21:57:04', '2025-12-10 21:57:04', '2025-12-10 21:57:04');
INSERT INTO `refresh_tokens` VALUES (109, 68, 'dd159767-f810-49b6-bdf1-4c37bffd2b96', '2026-01-09 22:01:12', '2025-12-10 22:01:12', '2025-12-10 22:01:12');
INSERT INTO `refresh_tokens` VALUES (110, 1, 'ad2ec2d8-52d8-4140-bd4a-5c52c03672f1', '2026-01-09 22:01:16', '2025-12-10 22:01:16', '2025-12-10 22:01:16');
INSERT INTO `refresh_tokens` VALUES (111, 1, '21a076b5-eeb7-4c16-900f-f5e41d988bba', '2026-01-09 22:04:45', '2025-12-10 22:04:45', '2025-12-10 22:04:45');
INSERT INTO `refresh_tokens` VALUES (112, 68, '42b1633c-e927-4d1e-95bb-da8e16606a49', '2026-01-09 22:08:00', '2025-12-10 22:08:00', '2025-12-10 22:08:00');
INSERT INTO `refresh_tokens` VALUES (113, 68, 'acd0e2bb-140c-4b4c-bee8-ae6c2e64148d', '2026-01-10 20:42:11', '2025-12-11 20:42:11', '2025-12-11 20:42:11');
INSERT INTO `refresh_tokens` VALUES (114, 69, '150e31a9-e71b-43b1-a154-b97fb70251df', '2026-01-10 23:55:22', '2025-12-11 23:55:22', '2025-12-11 23:55:22');
INSERT INTO `refresh_tokens` VALUES (115, 69, 'fbfe59c9-6c96-4384-aed7-89a0ae184daf', '2026-01-10 23:57:04', '2025-12-11 23:57:04', '2025-12-11 23:57:04');
INSERT INTO `refresh_tokens` VALUES (116, 69, 'd304517a-23d6-43a1-a4bc-becbdc2b005d', '2026-01-10 23:57:41', '2025-12-11 23:57:41', '2025-12-11 23:57:41');
INSERT INTO `refresh_tokens` VALUES (117, 69, 'd2d71e8e-3310-4811-93a6-8781f0232ae3', '2026-01-11 07:14:06', '2025-12-12 07:14:06', '2025-12-12 07:14:06');
INSERT INTO `refresh_tokens` VALUES (118, 1, '68283c67-08d4-4a1e-b637-7e10b40b36ff', '2026-01-12 11:22:20', '2025-12-13 11:22:20', '2025-12-13 11:22:20');
INSERT INTO `refresh_tokens` VALUES (119, 69, '78067b10-f609-4f9a-9181-07a7c8ad0a76', '2026-01-14 07:37:59', '2025-12-15 07:37:59', '2025-12-15 07:37:59');
INSERT INTO `refresh_tokens` VALUES (120, 69, '86cc9511-ea98-4286-b812-2142f7b8f49e', '2026-01-14 07:39:01', '2025-12-15 07:39:01', '2025-12-15 07:39:01');
INSERT INTO `refresh_tokens` VALUES (121, 68, '8dfa08ae-c956-4820-b32a-8be60fc6d9c3', '2026-01-14 10:22:50', '2025-12-15 10:22:50', '2025-12-15 10:22:50');
INSERT INTO `refresh_tokens` VALUES (122, 69, 'c7243524-36ff-4b3c-981e-fa9a8bcf3ff5', '2026-01-15 05:00:18', '2025-12-16 05:00:18', '2025-12-16 05:00:18');
INSERT INTO `refresh_tokens` VALUES (123, 69, '4bae69dc-1cb8-418c-8eb4-a59e98189987', '2026-01-16 00:03:51', '2025-12-17 00:03:51', '2025-12-17 00:03:51');
INSERT INTO `refresh_tokens` VALUES (124, 69, '982380dd-7365-4c94-84cc-db327c1426e2', '2026-01-16 00:04:32', '2025-12-17 00:04:32', '2025-12-17 00:04:32');
INSERT INTO `refresh_tokens` VALUES (125, 69, '13e068b5-01ab-46df-a478-9ec3458c6fb8', '2026-01-17 03:18:54', '2025-12-18 03:18:54', '2025-12-18 03:18:54');
INSERT INTO `refresh_tokens` VALUES (126, 69, '9d252a6c-4ed6-4aed-ae2d-53d8cf14585b', '2026-01-21 00:05:51', '2025-12-22 00:05:51', '2025-12-22 00:05:51');
INSERT INTO `refresh_tokens` VALUES (127, 1, '98cef864-8ee5-420e-baf9-793333afc190', '2026-01-21 00:17:55', '2025-12-22 00:17:55', '2025-12-22 00:17:55');
INSERT INTO `refresh_tokens` VALUES (128, 1, 'f819b075-1f66-4e71-b3ed-7fc736213c53', '2026-01-21 01:28:23', '2025-12-22 01:28:23', '2025-12-22 01:28:23');
INSERT INTO `refresh_tokens` VALUES (129, 1, 'cc61380b-f1a5-4aa2-b665-7fd1173fee0d', '2026-01-21 02:28:50', '2025-12-22 02:28:50', '2025-12-22 02:28:50');
INSERT INTO `refresh_tokens` VALUES (130, 1, 'aee50707-51d9-463f-98d1-2a6f0c2d32bf', '2026-01-21 03:29:11', '2025-12-22 03:29:11', '2025-12-22 03:29:11');
INSERT INTO `refresh_tokens` VALUES (131, 1, 'bcae78e3-e4dd-4a8f-81fd-aad65c412c47', '2026-01-21 04:23:02', '2025-12-22 04:23:02', '2025-12-22 04:23:02');
INSERT INTO `refresh_tokens` VALUES (132, 1, 'e53bb46c-8cd3-4741-8ea4-8d46722d568a', '2026-01-21 04:30:06', '2025-12-22 04:30:06', '2025-12-22 04:30:06');
INSERT INTO `refresh_tokens` VALUES (133, 1, 'acbf577e-58d9-4ba9-83cc-ccc636ae631d', '2026-01-21 05:16:47', '2025-12-22 05:16:47', '2025-12-22 05:16:47');
INSERT INTO `refresh_tokens` VALUES (134, 68, 'a767e0b7-970f-4aeb-b186-0c1ee23e7d7a', '2026-01-21 11:23:58', '2025-12-22 11:23:58', '2025-12-22 11:23:58');
INSERT INTO `refresh_tokens` VALUES (135, 68, 'edfce6eb-63a7-4b30-b127-50b5e32e5cd5', '2026-01-23 06:34:16', '2025-12-24 06:34:16', '2025-12-24 06:34:16');
INSERT INTO `refresh_tokens` VALUES (136, 68, '44ee2045-6256-4d87-9379-322619b170fb', '2026-01-27 21:21:48', '2025-12-28 21:21:48', '2025-12-28 21:21:48');
INSERT INTO `refresh_tokens` VALUES (137, 68, '1f110c94-1b35-4d40-8e6a-12584c046f92', '2026-01-27 21:31:31', '2025-12-28 21:31:31', '2025-12-28 21:31:31');
INSERT INTO `refresh_tokens` VALUES (138, 68, '375a01f9-0a49-43bd-8a42-268cd3d6ef0e', '2026-01-27 22:32:32', '2025-12-28 22:32:32', '2025-12-28 22:32:32');
INSERT INTO `refresh_tokens` VALUES (139, 68, '7a436f89-80ed-4950-8f44-c215de6d7a7f', '2026-01-28 20:31:41', '2025-12-29 20:31:41', '2025-12-29 20:31:41');
INSERT INTO `refresh_tokens` VALUES (140, 68, '1f30aad8-572c-4998-9708-5a47c7fffec0', '2026-01-28 21:34:53', '2025-12-29 21:34:53', '2025-12-29 21:34:53');
INSERT INTO `refresh_tokens` VALUES (141, 68, 'ac846ac4-a9ce-4544-adc3-655ea03ea6c6', '2026-02-19 09:21:54', '2026-01-20 09:21:54', '2026-01-20 09:21:54');
INSERT INTO `refresh_tokens` VALUES (142, 1, 'de3ff835-6f01-4164-911f-5e5a323ce3de', '2026-02-25 21:02:36', '2026-01-26 21:02:36', '2026-01-26 21:02:36');
INSERT INTO `refresh_tokens` VALUES (143, 69, 'a85a7a32-f52f-4058-afaf-14846b044bf2', '2026-02-25 21:58:42', '2026-01-26 21:58:42', '2026-01-26 21:58:42');
INSERT INTO `refresh_tokens` VALUES (144, 69, 'f90c2063-3a3c-4b11-ac48-803226af50b5', '2026-02-25 21:58:51', '2026-01-26 21:58:51', '2026-01-26 21:58:51');
INSERT INTO `refresh_tokens` VALUES (145, 69, '500fe3c0-be5f-4e2c-b944-dae2d93b3d91', '2026-02-25 21:58:58', '2026-01-26 21:58:58', '2026-01-26 21:58:58');
INSERT INTO `refresh_tokens` VALUES (146, 69, '024a0319-45f9-4590-a485-c52b8664782e', '2026-02-25 21:59:04', '2026-01-26 21:59:04', '2026-01-26 21:59:04');
INSERT INTO `refresh_tokens` VALUES (147, 69, '93e550cf-757e-4c18-81db-0450b26d243b', '2026-02-25 21:59:26', '2026-01-26 21:59:26', '2026-01-26 21:59:26');
INSERT INTO `refresh_tokens` VALUES (148, 69, '090c8f66-d529-42d0-b103-918906bae583', '2026-02-25 22:02:41', '2026-01-26 22:02:41', '2026-01-26 22:02:41');
INSERT INTO `refresh_tokens` VALUES (149, 68, '4e6a5fec-ab2a-415d-bfba-a5aec4fe46c3', '2026-02-25 22:03:47', '2026-01-26 22:03:47', '2026-01-26 22:03:47');
INSERT INTO `refresh_tokens` VALUES (150, 68, '3524df87-7315-4d2f-924a-b1ef836499bd', '2026-02-25 22:04:36', '2026-01-26 22:04:36', '2026-01-26 22:04:36');
INSERT INTO `refresh_tokens` VALUES (151, 1, 'ae47f7c5-eadc-4f1f-8b6a-a64a98877ffd', '2026-02-25 22:04:41', '2026-01-26 22:04:41', '2026-01-26 22:04:41');
INSERT INTO `refresh_tokens` VALUES (152, 68, '5c2fe876-cef2-4f30-9017-16087dd656d8', '2026-02-25 22:08:33', '2026-01-26 22:08:33', '2026-01-26 22:08:33');
INSERT INTO `refresh_tokens` VALUES (153, 1, 'e4f456e1-862d-40c9-909d-85a5370962f1', '2026-03-02 06:33:21', '2026-01-31 06:33:21', '2026-01-31 06:33:21');
INSERT INTO `refresh_tokens` VALUES (154, 1, 'e6462bfe-ceca-4561-ac94-a564c0b70579', '2026-03-02 07:30:43', '2026-01-31 07:30:43', '2026-01-31 07:30:43');
INSERT INTO `refresh_tokens` VALUES (155, 1, '1ff39311-82ef-4d2a-9deb-040db3c396e6', '2026-03-02 08:51:11', '2026-01-31 08:51:11', '2026-01-31 08:51:11');
INSERT INTO `refresh_tokens` VALUES (156, 1, 'a97a2fe4-cb38-4c03-9c33-9037e2cce7a2', '2026-03-02 08:51:24', '2026-01-31 08:51:24', '2026-01-31 08:51:24');
INSERT INTO `refresh_tokens` VALUES (157, 1, '17d6a457-1354-407e-9b31-1914278a6f2e', '2026-03-02 09:38:39', '2026-01-31 09:38:39', '2026-01-31 09:38:39');
INSERT INTO `refresh_tokens` VALUES (158, 1, '0a6af6d3-4f3f-467d-9f26-82bb436ebd5d', '2026-03-02 09:41:19', '2026-01-31 09:41:19', '2026-01-31 09:41:19');
INSERT INTO `refresh_tokens` VALUES (159, 1, 'bb5dacbb-b0ef-4401-802d-403534f8349b', '2026-03-02 10:12:23', '2026-01-31 10:12:23', '2026-01-31 10:12:23');
INSERT INTO `refresh_tokens` VALUES (160, 1, '641ed7f5-3a33-476e-8f25-dae6d598f63c', '2026-03-02 10:17:36', '2026-01-31 10:17:36', '2026-01-31 10:17:36');
INSERT INTO `refresh_tokens` VALUES (161, 1, 'cd7d793e-6397-4098-9bbc-0068e9cbf08d', '2026-03-02 10:58:05', '2026-01-31 10:58:05', '2026-01-31 10:58:05');
INSERT INTO `refresh_tokens` VALUES (162, 1, 'd1394c34-85d3-48d6-a8e8-19c44a381518', '2026-03-02 11:44:26', '2026-01-31 11:44:26', '2026-01-31 11:44:26');
INSERT INTO `refresh_tokens` VALUES (163, 1, '0fbe3319-4415-4e06-9da7-4c9ac3fed9ce', '2026-03-02 12:23:12', '2026-01-31 12:23:12', '2026-01-31 12:23:12');
INSERT INTO `refresh_tokens` VALUES (164, 1, 'a59dd899-35ec-4f55-9972-0b48f551c98e', '2026-03-02 12:42:31', '2026-01-31 12:42:31', '2026-01-31 12:42:31');
INSERT INTO `refresh_tokens` VALUES (165, 1, '469d707a-df32-4fcd-88b8-fce9be9b2bd1', '2026-03-02 12:44:30', '2026-01-31 12:44:30', '2026-01-31 12:44:30');
INSERT INTO `refresh_tokens` VALUES (166, 1, '5c2e8307-02e7-4433-ada1-b571ae575b85', '2026-03-02 12:51:38', '2026-01-31 12:51:38', '2026-01-31 12:51:38');
INSERT INTO `refresh_tokens` VALUES (167, 1, 'e1f437bf-fab5-4f33-b239-f817860c030e', '2026-03-02 12:58:56', '2026-01-31 12:58:56', '2026-01-31 12:58:56');
INSERT INTO `refresh_tokens` VALUES (168, 1, '3e834ef7-6bff-4f96-b25b-7d7a84f9c472', '2026-03-02 12:59:46', '2026-01-31 12:59:46', '2026-01-31 12:59:46');
INSERT INTO `refresh_tokens` VALUES (169, 1, '61c63aaf-5519-41d9-ac80-42875243cd02', '2026-03-02 13:05:01', '2026-01-31 13:05:01', '2026-01-31 13:05:01');
INSERT INTO `refresh_tokens` VALUES (170, 1, 'b0e631f9-7cff-4109-947d-fc1ad82e1cdc', '2026-03-02 13:15:43', '2026-01-31 13:15:43', '2026-01-31 13:15:43');
INSERT INTO `refresh_tokens` VALUES (171, 1, 'daf76672-6d24-4755-b493-bfdc1f8ffff5', '2026-03-02 13:20:52', '2026-01-31 13:20:52', '2026-01-31 13:20:52');
INSERT INTO `refresh_tokens` VALUES (172, 1, 'f0c6be84-2e8b-41b2-9557-35b50a257e1e', '2026-03-02 13:35:06', '2026-01-31 13:35:06', '2026-01-31 13:35:06');
INSERT INTO `refresh_tokens` VALUES (173, 1, '28ca9006-5f11-4b3b-a6b4-b8eb8ba37dba', '2026-03-10 07:51:27', '2026-02-08 07:51:27', '2026-02-08 07:51:27');
INSERT INTO `refresh_tokens` VALUES (174, 1, 'eb1f748d-9b85-4d18-a7ac-88726d8d0174', '2026-03-10 08:57:44', '2026-02-08 08:57:44', '2026-02-08 08:57:44');
INSERT INTO `refresh_tokens` VALUES (175, 1, '8789b391-7d19-40d3-91b5-2161dbeee9e3', '2026-03-10 10:02:12', '2026-02-08 10:02:12', '2026-02-08 10:02:12');
INSERT INTO `refresh_tokens` VALUES (176, 1, 'a46f27d6-8f3e-4c62-b151-038d897883cc', '2026-03-10 10:45:41', '2026-02-08 10:45:41', '2026-02-08 10:45:41');
INSERT INTO `refresh_tokens` VALUES (177, 1, '13ef95f2-45f9-4286-b7ee-0a1d078ea443', '2026-03-10 11:44:09', '2026-02-08 11:44:09', '2026-02-08 11:44:09');
INSERT INTO `refresh_tokens` VALUES (178, 1, 'ce3cbe83-cb10-4257-9eb1-47462c5458de', '2026-03-10 13:11:18', '2026-02-08 13:11:18', '2026-02-08 13:11:18');
INSERT INTO `refresh_tokens` VALUES (179, 1, '12c61a07-0390-43d5-b223-7f1758f5fb66', '2026-03-10 14:55:36', '2026-02-08 14:55:36', '2026-02-08 14:55:36');
INSERT INTO `refresh_tokens` VALUES (180, 1, '453cbae1-0696-42f4-a379-1fddd15c7a0e', '2026-03-10 16:21:14', '2026-02-08 16:21:14', '2026-02-08 16:21:14');
INSERT INTO `refresh_tokens` VALUES (181, 1, '6ec663aa-f8ae-45df-9fb8-2d6a907064d1', '2026-03-10 16:27:38', '2026-02-08 16:27:38', '2026-02-08 16:27:38');
INSERT INTO `refresh_tokens` VALUES (182, 1, 'e3787f70-a016-4a75-a798-4c18b3e15da9', '2026-03-10 21:36:56', '2026-02-08 21:36:56', '2026-02-08 21:36:56');
INSERT INTO `refresh_tokens` VALUES (183, 1, '201efa6b-0e27-48f7-b38a-43b31f286419', '2026-03-10 21:49:11', '2026-02-08 21:49:11', '2026-02-08 21:49:11');
INSERT INTO `refresh_tokens` VALUES (184, 1, 'e5f0fe63-500c-42fa-b97c-934901c68a5c', '2026-03-11 22:18:15', '2026-02-09 22:18:15', '2026-02-09 22:18:15');
INSERT INTO `refresh_tokens` VALUES (185, 1, 'b16051e2-60f1-416f-a2aa-4ac449d8d200', '2026-03-11 23:07:16', '2026-02-09 23:07:16', '2026-02-09 23:07:16');
INSERT INTO `refresh_tokens` VALUES (186, 1, '891558b3-57a0-40e7-889d-beb217f6a836', '2026-03-12 03:31:50', '2026-02-10 03:31:50', '2026-02-10 03:31:50');
INSERT INTO `refresh_tokens` VALUES (187, 1, 'ac83f20f-4bc7-4091-af9a-210f2e390ea7', '2026-03-12 04:36:18', '2026-02-10 04:36:18', '2026-02-10 04:36:18');
INSERT INTO `refresh_tokens` VALUES (188, 1, '06f0ea1a-6542-402b-95d5-f66c7a9ec558', '2026-03-12 05:34:49', '2026-02-10 05:34:49', '2026-02-10 05:34:49');
INSERT INTO `refresh_tokens` VALUES (190, 1, 'f136e312-3a7e-4af1-84f3-0ec757aca534', '2026-03-14 03:36:27', '2026-02-12 03:36:27', '2026-02-12 03:36:27');
INSERT INTO `refresh_tokens` VALUES (191, 1, 'f47efd87-c517-48f7-b34d-baf11ea0a032', '2026-03-14 03:36:45', '2026-02-12 03:36:45', '2026-02-12 03:36:45');
INSERT INTO `refresh_tokens` VALUES (193, 1, '4c9a1219-6943-4572-b270-c1f2f346eaf9', '2026-03-14 03:37:40', '2026-02-12 03:37:40', '2026-02-12 03:37:40');
INSERT INTO `refresh_tokens` VALUES (194, 1, 'c9b332c9-0c19-46cb-857a-ead44140a9e1', '2026-03-14 03:37:46', '2026-02-12 03:37:46', '2026-02-12 03:37:46');
INSERT INTO `refresh_tokens` VALUES (195, 1, '80a840b3-fe83-4847-827c-325d60a930e2', '2026-03-14 03:38:11', '2026-02-12 03:38:11', '2026-02-12 03:38:11');
INSERT INTO `refresh_tokens` VALUES (196, 1, 'be8cb333-fac7-4b21-8db3-4106610fe6eb', '2026-03-14 03:38:27', '2026-02-12 03:38:27', '2026-02-12 03:38:27');

-- ----------------------------
-- Table structure for seguridad_menu_objetos_roles
-- ----------------------------
DROP TABLE IF EXISTS `seguridad_menu_objetos_roles`;
CREATE TABLE `seguridad_menu_objetos_roles`  (
  `id_roles` int NOT NULL,
  `id_menu_objetos` int NOT NULL,
  PRIMARY KEY (`id_roles`, `id_menu_objetos`) USING BTREE,
  INDEX `fk_smor_roles`(`id_roles` ASC) USING BTREE,
  INDEX `fk_smor_menu_objetos`(`id_menu_objetos` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of seguridad_menu_objetos_roles
-- ----------------------------

-- ----------------------------
-- Table structure for seguridad_perfil
-- ----------------------------
DROP TABLE IF EXISTS `seguridad_perfil`;
CREATE TABLE `seguridad_perfil`  (
  `id_perfil` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `Activo` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'S' COMMENT 'Estado del usuario: S = Activo, N = Inactivo',
  PRIMARY KEY (`id_perfil`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seguridad_perfil
-- ----------------------------
INSERT INTO `seguridad_perfil` VALUES (1, 'ADMINISTRADOR', '2025-01-16 11:31:29', '2025-02-21 19:11:47', 'S');
INSERT INTO `seguridad_perfil` VALUES (2, 'INGENIERIA', '2025-01-16 11:31:29', '2025-02-21 19:11:59', 'S');
INSERT INTO `seguridad_perfil` VALUES (16, 'ESTUDIANTE', '2025-02-09 08:38:57', '2025-02-21 19:12:02', 'S');

-- ----------------------------
-- Table structure for seguridad_perfil_users
-- ----------------------------
DROP TABLE IF EXISTS `seguridad_perfil_users`;
CREATE TABLE `seguridad_perfil_users`  (
  `id_perfil_users` int NOT NULL AUTO_INCREMENT,
  `id_usuario` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `id_perfil` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_perfil_users`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 50 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seguridad_perfil_users
-- ----------------------------
INSERT INTO `seguridad_perfil_users` VALUES (39, '13', '1', '2025-01-27 18:03:14');
INSERT INTO `seguridad_perfil_users` VALUES (40, '1', '1', '2025-01-29 00:39:33');
INSERT INTO `seguridad_perfil_users` VALUES (43, '6', '2', '2025-02-08 14:50:48');
INSERT INTO `seguridad_perfil_users` VALUES (46, '24', '16', '2025-02-10 16:02:37');
INSERT INTO `seguridad_perfil_users` VALUES (49, '68', '1', '2025-12-10 22:05:07');

-- ----------------------------
-- Table structure for seguridad_roles
-- ----------------------------
DROP TABLE IF EXISTS `seguridad_roles`;
CREATE TABLE `seguridad_roles`  (
  `id_roles` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `Activo` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'S' COMMENT 'Estado del usuario: S = Activo, N = Inactivo',
  PRIMARY KEY (`id_roles`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seguridad_roles
-- ----------------------------
INSERT INTO `seguridad_roles` VALUES (1, 'ACCESO GENERAL', '2025-01-15 16:51:11', '2025-02-21 19:09:03', 'S');
INSERT INTO `seguridad_roles` VALUES (4, 'CAJERO', '2025-01-15 16:51:11', '2025-02-21 19:08:58', 'S');
INSERT INTO `seguridad_roles` VALUES (6, 'VENTAS', '2025-01-15 16:51:11', '2025-02-21 19:08:48', 'S');
INSERT INTO `seguridad_roles` VALUES (7, 'SOPORTE TÉCNICO', '2025-01-15 16:51:11', '2025-02-21 19:08:52', 'S');
INSERT INTO `seguridad_roles` VALUES (16, 'PRACTICANTE', '2025-02-09 08:39:25', '2025-02-09 08:39:25', 'S');

-- ----------------------------
-- Table structure for seguridad_roles_menu
-- ----------------------------
DROP TABLE IF EXISTS `seguridad_roles_menu`;
CREATE TABLE `seguridad_roles_menu`  (
  `id_roles` int NULL DEFAULT NULL,
  `id_menu` int NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seguridad_roles_menu
-- ----------------------------
INSERT INTO `seguridad_roles_menu` VALUES (1, 12);
INSERT INTO `seguridad_roles_menu` VALUES (1, 13);
INSERT INTO `seguridad_roles_menu` VALUES (1, 14);
INSERT INTO `seguridad_roles_menu` VALUES (1, 4);
INSERT INTO `seguridad_roles_menu` VALUES (1, 5);
INSERT INTO `seguridad_roles_menu` VALUES (1, 15);
INSERT INTO `seguridad_roles_menu` VALUES (1, 16);
INSERT INTO `seguridad_roles_menu` VALUES (1, 17);
INSERT INTO `seguridad_roles_menu` VALUES (1, 18);
INSERT INTO `seguridad_roles_menu` VALUES (1, 19);
INSERT INTO `seguridad_roles_menu` VALUES (1, 20);
INSERT INTO `seguridad_roles_menu` VALUES (1, 21);
INSERT INTO `seguridad_roles_menu` VALUES (1, 22);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1223);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1224);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1225);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1226);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1227);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1228);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1229);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1230);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1231);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1232);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1233);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1323);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1324);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1325);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1326);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1327);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1328);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1329);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1330);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1331);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1332);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1333);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1423);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1424);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1425);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1426);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1427);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1428);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1429);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1430);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1431);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1432);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1433);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1523);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1524);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1525);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1526);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1527);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1528);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1529);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1530);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1531);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1532);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1533);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1623);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1624);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1625);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1626);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1627);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1628);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1629);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1630);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1631);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1632);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1633);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1723);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1724);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1725);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1726);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1727);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1728);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1729);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1730);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1731);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1732);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1733);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1823);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1824);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1825);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1826);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1827);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1828);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1829);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1830);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1831);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1832);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1833);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1923);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1924);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1925);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1926);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1927);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1928);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1929);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1930);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1931);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1932);
INSERT INTO `seguridad_roles_menu` VALUES (1, 1933);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2023);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2024);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2025);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2026);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2027);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2028);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2029);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2030);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2031);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2032);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2033);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2123);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2124);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2125);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2126);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2127);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2128);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2129);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2130);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2131);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2132);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2133);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2223);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2224);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2225);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2226);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2227);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2228);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2229);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2230);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2231);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2232);
INSERT INTO `seguridad_roles_menu` VALUES (1, 2233);
INSERT INTO `seguridad_roles_menu` VALUES (7, 12);
INSERT INTO `seguridad_roles_menu` VALUES (7, 13);
INSERT INTO `seguridad_roles_menu` VALUES (7, 14);
INSERT INTO `seguridad_roles_menu` VALUES (7, 4);
INSERT INTO `seguridad_roles_menu` VALUES (7, 5);
INSERT INTO `seguridad_roles_menu` VALUES (7, 15);
INSERT INTO `seguridad_roles_menu` VALUES (7, 16);
INSERT INTO `seguridad_roles_menu` VALUES (7, 17);
INSERT INTO `seguridad_roles_menu` VALUES (7, 18);
INSERT INTO `seguridad_roles_menu` VALUES (7, 19);
INSERT INTO `seguridad_roles_menu` VALUES (7, 20);
INSERT INTO `seguridad_roles_menu` VALUES (7, 21);
INSERT INTO `seguridad_roles_menu` VALUES (7, 22);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1223);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1224);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1225);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1226);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1227);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1228);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1229);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1230);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1231);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1232);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1233);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1323);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1324);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1325);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1326);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1327);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1328);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1329);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1330);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1331);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1332);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1333);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1423);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1424);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1425);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1426);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1427);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1428);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1429);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1430);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1431);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1432);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1433);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1523);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1524);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1525);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1526);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1527);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1528);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1529);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1530);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1531);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1532);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1533);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1623);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1624);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1625);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1626);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1627);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1628);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1629);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1630);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1631);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1632);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1633);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1723);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1724);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1725);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1726);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1727);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1728);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1729);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1730);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1731);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1732);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1733);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1823);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1824);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1825);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1826);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1827);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1828);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1829);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1830);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1831);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1832);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1833);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1923);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1924);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1925);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1926);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1927);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1928);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1929);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1930);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1931);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1932);
INSERT INTO `seguridad_roles_menu` VALUES (7, 1933);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2023);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2024);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2025);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2026);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2027);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2028);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2029);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2030);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2031);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2032);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2033);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2123);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2124);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2125);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2126);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2127);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2128);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2129);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2130);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2131);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2132);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2133);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2223);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2224);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2225);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2226);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2227);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2228);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2229);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2230);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2231);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2232);
INSERT INTO `seguridad_roles_menu` VALUES (7, 2233);
INSERT INTO `seguridad_roles_menu` VALUES (16, 12);
INSERT INTO `seguridad_roles_menu` VALUES (16, 1223);
INSERT INTO `seguridad_roles_menu` VALUES (16, 1224);
INSERT INTO `seguridad_roles_menu` VALUES (16, 1225);
INSERT INTO `seguridad_roles_menu` VALUES (16, 1226);
INSERT INTO `seguridad_roles_menu` VALUES (16, 1227);
INSERT INTO `seguridad_roles_menu` VALUES (16, 1228);
INSERT INTO `seguridad_roles_menu` VALUES (16, 1229);
INSERT INTO `seguridad_roles_menu` VALUES (16, 1230);
INSERT INTO `seguridad_roles_menu` VALUES (16, 1231);
INSERT INTO `seguridad_roles_menu` VALUES (16, 1232);
INSERT INTO `seguridad_roles_menu` VALUES (16, 1233);
INSERT INTO `seguridad_roles_menu` VALUES (4, 1224);

-- ----------------------------
-- Table structure for seguridad_roles_perfil
-- ----------------------------
DROP TABLE IF EXISTS `seguridad_roles_perfil`;
CREATE TABLE `seguridad_roles_perfil`  (
  `id_roles_perfil` int NOT NULL AUTO_INCREMENT,
  `id_perfil` int NULL DEFAULT NULL,
  `id_roles` int NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_roles_perfil`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seguridad_roles_perfil
-- ----------------------------
INSERT INTO `seguridad_roles_perfil` VALUES (1, 1, 1, '2025-02-04 00:36:06');
INSERT INTO `seguridad_roles_perfil` VALUES (4, 2, 7, '2025-02-04 00:36:41');
INSERT INTO `seguridad_roles_perfil` VALUES (8, 16, 4, '2025-02-21 12:43:50');

-- ----------------------------
-- Table structure for sistema_menu
-- ----------------------------
DROP TABLE IF EXISTS `sistema_menu`;
CREATE TABLE `sistema_menu`  (
  `id_menu` int NOT NULL AUTO_INCREMENT,
  `id_modulo` int NULL DEFAULT NULL,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `Activo` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'S' COMMENT 'Estado del usuario: S = Activo, N = Inactivo',
  PRIMARY KEY (`id_menu`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 40 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sistema_menu
-- ----------------------------
INSERT INTO `sistema_menu` VALUES (12, 1, NULL, NULL, '2025-01-28 05:58:31', '2025-01-28 05:58:31', 'S');
INSERT INTO `sistema_menu` VALUES (13, 2, NULL, NULL, '2025-01-28 05:58:31', '2025-01-28 05:58:31', 'S');
INSERT INTO `sistema_menu` VALUES (14, 3, NULL, NULL, '2025-01-28 05:58:31', '2025-01-28 05:58:31', 'S');
INSERT INTO `sistema_menu` VALUES (15, 4, 'Clientes', NULL, '2025-01-28 05:58:31', '2025-01-28 05:58:31', 'S');
INSERT INTO `sistema_menu` VALUES (16, 4, 'Empleados', NULL, '2025-01-28 05:58:31', '2025-01-28 05:58:31', 'S');
INSERT INTO `sistema_menu` VALUES (17, 4, 'Vendedor', NULL, '2025-01-28 05:58:31', '2025-01-28 05:58:31', 'S');
INSERT INTO `sistema_menu` VALUES (18, 4, 'Unidad de Medida', NULL, '2025-01-28 05:58:31', '2025-01-28 05:58:31', 'S');
INSERT INTO `sistema_menu` VALUES (19, 4, 'Tipo de Bomba', NULL, '2025-01-28 05:58:31', '2025-01-28 05:58:31', 'S');
INSERT INTO `sistema_menu` VALUES (20, 5, 'Usuarios', NULL, '2025-01-28 05:58:31', '2025-01-28 05:58:31', 'S');
INSERT INTO `sistema_menu` VALUES (21, 5, 'Perfil', NULL, '2025-01-28 05:58:31', '2025-01-28 05:58:31', 'S');
INSERT INTO `sistema_menu` VALUES (22, 5, 'Roles', NULL, '2025-01-28 05:58:31', '2025-01-28 05:58:31', 'S');

-- ----------------------------
-- Table structure for sistema_menu_objetos
-- ----------------------------
DROP TABLE IF EXISTS `sistema_menu_objetos`;
CREATE TABLE `sistema_menu_objetos`  (
  `id_menu_objetos` int NOT NULL AUTO_INCREMENT,
  `id_menu` int NULL DEFAULT NULL,
  `id_objetos` int NULL DEFAULT NULL,
  `selected` bit(1) NULL DEFAULT NULL,
  `orden` int NULL DEFAULT NULL,
  `estado` int NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `Activo` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'S' COMMENT 'Estado del usuario: S = Activo, N = Inactivo',
  PRIMARY KEY (`id_menu_objetos`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 155 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sistema_menu_objetos
-- ----------------------------
INSERT INTO `sistema_menu_objetos` VALUES (1, 12, 23, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (2, 12, 24, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (3, 12, 25, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (4, 12, 26, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (5, 12, 27, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (6, 12, 28, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (7, 12, 29, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (8, 12, 30, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (9, 12, 31, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (10, 12, 32, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (11, 12, 33, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (12, 13, 23, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (13, 13, 24, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (14, 13, 25, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (15, 13, 26, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (16, 13, 27, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (17, 13, 28, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (18, 13, 29, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (19, 13, 30, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (20, 13, 31, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (21, 13, 32, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (22, 13, 33, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (23, 14, 23, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (24, 14, 24, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (25, 14, 25, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (26, 14, 26, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (27, 14, 27, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (28, 14, 28, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (29, 14, 29, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (30, 14, 30, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (31, 14, 31, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (32, 14, 32, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (33, 14, 33, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (34, 15, 23, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (35, 15, 24, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (36, 15, 25, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (37, 15, 26, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (38, 15, 27, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (39, 15, 28, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (40, 15, 29, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (41, 15, 30, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (42, 15, 31, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (43, 15, 32, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (44, 15, 33, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (45, 16, 23, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (46, 16, 24, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (47, 16, 25, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (48, 16, 26, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (49, 16, 27, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (50, 16, 28, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (51, 16, 29, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (52, 16, 30, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (53, 16, 31, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (54, 16, 32, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (55, 16, 33, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (56, 17, 23, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (57, 17, 24, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (58, 17, 25, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (59, 17, 26, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (60, 17, 27, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (61, 17, 28, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (62, 17, 29, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (63, 17, 30, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (64, 17, 31, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (65, 17, 32, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (66, 17, 33, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (67, 18, 23, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (68, 18, 24, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (69, 18, 25, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (70, 18, 26, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (71, 18, 27, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (72, 18, 28, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (73, 18, 29, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (74, 18, 30, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (75, 18, 31, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (76, 18, 32, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (77, 18, 33, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (78, 19, 23, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (79, 19, 24, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (80, 19, 25, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (81, 19, 26, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (82, 19, 27, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (83, 19, 28, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (84, 19, 29, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (85, 19, 30, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (86, 19, 31, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (87, 19, 32, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (88, 19, 33, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (89, 20, 23, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (90, 20, 24, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (91, 20, 25, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (92, 20, 26, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (93, 20, 27, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (94, 20, 28, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (95, 20, 29, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (96, 20, 30, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (97, 20, 31, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (98, 20, 32, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (99, 20, 33, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (100, 21, 23, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (101, 21, 24, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (102, 21, 25, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (103, 21, 26, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (104, 21, 27, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (105, 21, 28, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (106, 21, 29, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (107, 21, 30, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (108, 21, 31, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (109, 21, 32, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (110, 21, 33, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (111, 22, 23, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (112, 22, 24, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (113, 22, 25, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (114, 22, 26, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (115, 22, 27, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (116, 22, 28, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (117, 22, 29, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (118, 22, 30, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (119, 22, 31, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (120, 22, 32, NULL, NULL, NULL, NULL, NULL, 'S');
INSERT INTO `sistema_menu_objetos` VALUES (121, 22, 33, NULL, NULL, NULL, NULL, NULL, 'S');

-- ----------------------------
-- Table structure for sistema_modulo
-- ----------------------------
DROP TABLE IF EXISTS `sistema_modulo`;
CREATE TABLE `sistema_modulo`  (
  `id_modulo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Activo` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'S' COMMENT 'Estado del usuario: S = Activo, N = Inactivo',
  `Icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Nivel` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `Orden` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `expanded` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_modulo`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sistema_modulo
-- ----------------------------
INSERT INTO `sistema_modulo` VALUES (1, 'Programacion', 'S', NULL, NULL, NULL, NULL, '2025-01-16 05:56:25', '2025-01-16 05:56:25');
INSERT INTO `sistema_modulo` VALUES (2, 'Carguios', 'S', NULL, NULL, NULL, NULL, '2025-01-16 05:56:25', '2025-01-16 05:56:25');
INSERT INTO `sistema_modulo` VALUES (3, 'Diseños', 'S', NULL, NULL, NULL, NULL, '2025-01-16 05:56:25', '2025-01-16 05:56:25');
INSERT INTO `sistema_modulo` VALUES (4, 'Administracion', 'S', NULL, NULL, NULL, NULL, '2025-01-16 05:56:25', '2025-01-16 05:56:25');
INSERT INTO `sistema_modulo` VALUES (5, 'Seguridad', 'S', NULL, NULL, NULL, NULL, '2025-01-16 05:56:25', '2025-01-16 05:56:25');

-- ----------------------------
-- Table structure for sistema_objetos
-- ----------------------------
DROP TABLE IF EXISTS `sistema_objetos`;
CREATE TABLE `sistema_objetos`  (
  `id_objetos` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_objetos`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 34 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sistema_objetos
-- ----------------------------
INSERT INTO `sistema_objetos` VALUES (23, 'EDITAR', '2025-01-13 21:04:53', '2025-01-13 21:04:53');
INSERT INTO `sistema_objetos` VALUES (24, 'ELIMINAR', '2025-01-13 21:04:53', '2025-01-13 21:04:53');
INSERT INTO `sistema_objetos` VALUES (25, 'BUSCAR', '2025-01-13 21:04:53', '2025-01-13 21:04:53');
INSERT INTO `sistema_objetos` VALUES (26, 'EXPORTAR', '2025-01-13 21:04:53', '2025-01-13 21:04:53');
INSERT INTO `sistema_objetos` VALUES (27, 'ACTUALIZAR', '2025-01-13 21:04:53', '2025-01-13 21:04:53');
INSERT INTO `sistema_objetos` VALUES (28, 'CREAR', '2025-01-13 21:04:53', '2025-01-13 21:04:53');
INSERT INTO `sistema_objetos` VALUES (29, 'AGREGAR MATERIAL', '2025-01-13 21:04:53', '2025-01-13 21:04:53');
INSERT INTO `sistema_objetos` VALUES (30, 'AGREGAR PERFIL', '2025-01-13 21:04:53', '2025-01-13 21:04:53');
INSERT INTO `sistema_objetos` VALUES (31, 'AGREGAR ROL', '2025-01-13 21:04:53', '2025-01-13 21:04:53');
INSERT INTO `sistema_objetos` VALUES (32, 'AGREGAR PERMISO', '2025-01-13 21:04:53', '2025-01-13 21:04:53');
INSERT INTO `sistema_objetos` VALUES (33, 'LINK CARGUIO', NULL, NULL);
 
-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_owner` int NULL DEFAULT NULL COMMENT 'Autor quien creo el usuario: d_usuario',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `Activo` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'S' COMMENT 'Estado del usuario: S = Activo, N = Inactivo',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `google_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `two_factor_recovery_codes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `two_factor_secret` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `profile_photo_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_email_verified` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `users_email_unique`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 83 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'ADMIN', 'admin@gmail.com', NULL, NULL, '$2y$12$P3pPU3HuASxacwIDSECoa.U46wCUF61tVeKqUz2.h7egyfzi8EIh2', NULL, '2024-11-03 11:35:05', '2026-01-31 12:09:34', 'S', 'avatar/1769879374.jpg', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (51, 'Fernando Mariaca Castañeda', 'fmariacac@gmail.com', NULL, NULL, '$2y$12$B0y1BULliQjQk/8AQdl8x.zJeidWb4gbyXaJQa5Pre6vdvvkWVBVm', NULL, '2025-09-04 16:13:59', '2025-09-04 16:13:59', 'S', 'https://lh3.googleusercontent.com/a/ACg8ocIglFQsjaCvwoT1jd3_TYTUgKpiKyZEzlrOLZriZHCgB_BxcA=s96-c', '107849868542211081693', NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (52, 'Harry Ochoa', 'harryochoa32@gmail.com', NULL, NULL, '$2y$12$/694CRl7krFRi6cBMgw4vux93u0rlsWBy7u4o79LQRhReVCLP73Je', NULL, '2025-09-28 11:31:16', '2025-09-28 11:31:16', 'S', 'https://lh3.googleusercontent.com/a/ACg8ocK6Er7xowwu4P3SQO_0w2wonaql4ul0G2RyASiKpIaBhnk81Q=s96-c', '104821254524968727504', NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (53, 'Pablo Contreras', 'pacg1991@gmail.com', NULL, NULL, '$2y$12$cJBg1mXA3AUcgYNnUJbKsOR7vZ9e.C7z.hCxJk/Sgg3J9eNL.anCe', NULL, '2025-09-29 22:27:36', '2025-09-29 22:27:50', 'S', NULL, NULL, NULL, NULL, NULL, '1');
INSERT INTO `users` VALUES (54, 'Junior', 'junior.scream.jpc@gmail.com', NULL, NULL, '$2y$12$BKC/J5WEdXA0HNK1sQfA2eO2ooeloaJJb1LBAkqZhITkoYSiIYKCi', NULL, '2025-10-01 20:56:14', '2025-10-01 21:01:00', 'S', NULL, NULL, NULL, NULL, NULL, '1');
INSERT INTO `users` VALUES (55, 'JUNIORJPC', 'junior.jpc37@gmail.com', NULL, NULL, '$2y$12$i6pZVjAIRmdJGVV1SunA9OmJjefe65y.f.c1tWb7Z3cnwoxNrq9dq', NULL, '2025-10-02 12:19:56', '2025-10-02 12:20:54', 'S', NULL, NULL, NULL, NULL, NULL, '1');
INSERT INTO `users` VALUES (56, 'Jorge Jhovani Valverde Leon', 'ghiovani666@gmail.com', NULL, NULL, '$2y$12$uKnWZyz2Oy0LZnn/uqrmkOuNxFNjZ8dHZOt6aQNEh9jEnz7ugM12i', NULL, '2025-10-02 22:40:06', '2025-10-02 22:40:06', 'S', 'https://lh3.googleusercontent.com/a/ACg8ocLIsyXRBga_0KopugMtCUmHaPEWZqdiv1HDNLF13ufw9Lp6J-k=s96-c', '118004800935764570309', NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (57, 'Jhosep Huatuco Chunga', 'huatucochungajhosep@gmail.com', NULL, NULL, '$2y$12$/mE3AqFkuApjm1gJZlmf..SeZNS2M65v4g21rQ6Vc/d2MKpcMReIC', NULL, '2025-10-02 23:28:44', '2025-10-02 23:28:44', 'S', 'https://lh3.googleusercontent.com/a/ACg8ocIOgjM0cHUi4ixj-69GgIriqBrmev6MUR3mB8ryFHdfG4uUCA=s96-c', '102982154346953132366', NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (58, 'adminxx', 'adminxx@gmail.com', NULL, NULL, '$2y$12$LBH38TJxPAQ1Qoiyu2wL3.LQlH4oIl4jf7q4fQPrHI4qR5yOVGz8K', NULL, '2025-10-07 08:14:25', '2025-10-07 08:14:25', 'S', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (59, 'Carlos Brocca', 'carlosbroccar@gmail.com', NULL, NULL, '$2y$12$71YUnyb3G0trNwWu9CZ6IubxzuXa7ivSfroClhmYwmdcOOOxqDjOy', NULL, '2025-10-12 15:25:41', '2025-10-12 15:25:41', 'S', 'https://lh3.googleusercontent.com/a/ACg8ocI8CfLtNYr3UGipvmkv3Xs-n6FHnPDSaRKnOe25UU486-nRew=s96-c', '112150688055900907956', NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (60, 'pierina salet davila contreras', 'pierinasalet20@gmail.com', NULL, NULL, '$2y$12$kdI.BkRr2aI1qj635WyvcedwsPdXPGOVZljmZx1r4gfbLjqder1Yq', NULL, '2025-10-15 19:33:25', '2025-10-15 19:33:25', 'S', 'https://lh3.googleusercontent.com/a/ACg8ocIfoduHiv-mJjyP_SxkEE-4EkkUkQcKcxxGK2uU03ihNdYTfcnk=s96-c', '103930524992325225008', NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (61, 'Eliane', 'yanquialvaeliane@gmail.com', NULL, NULL, '$2y$12$3X5iYl4rGk.CV1V2.tVINOsiUR4Wic5cCmGHUY2W2VBJVYMQa8B8u', NULL, '2025-11-06 19:05:57', '2025-11-06 19:06:11', 'S', NULL, NULL, NULL, NULL, NULL, '1');
INSERT INTO `users` VALUES (62, 'Valerio Pizarro Andrada', 'jorge.vpa28@gmail.com', NULL, NULL, '$2y$12$0r4tkAqIoFYYE2WcucRNW.bdPn5xFCOZB49R6gqLRJcclXG/eukmy', NULL, '2025-11-27 14:00:25', '2025-11-27 14:00:25', 'S', 'https://lh3.googleusercontent.com/a/ACg8ocIL21ylR-W8LqBr8oEx_g28LFL1332g9TQGsexr87zpkYj48bQ=s96-c', '102819049280006921149', NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (63, 'Milton Alvarez', 'malvarez@sawa.mobi', NULL, NULL, '$2y$12$7wfJM02GrAi3h33sculBvefTIVSjMEwa0qs3fkQeOt/kPpBNKBGPO', NULL, '2025-11-28 20:47:53', '2025-11-28 20:47:53', 'S', 'https://lh3.googleusercontent.com/a/ACg8ocIBwHzgIXxt4Q7TaRemP5c7XmIyAAOTBrM1VaO8mk1LwAn6Dw=s96-c', '102048250137241088453', NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (64, 'ariela', 'arielavel@gmail.com', NULL, NULL, '$2y$12$VvPtPDg50pGHe.Rs9y4FIeimUzHHRasto.FnWJLAwcmW/y9r6JYy6', NULL, '2025-12-04 15:48:06', '2025-12-04 19:54:04', 'S', NULL, NULL, NULL, NULL, NULL, '1');
INSERT INTO `users` VALUES (65, 'DavidGM99', 'davidgm1999@hotmail.com', NULL, NULL, '$2y$12$rWZ.w8NFBSoub15EnNZOy.iz.jaHeXBb6ZOuruwXQHTbUut6itzym', NULL, '2025-12-09 15:39:18', '2025-12-09 15:39:18', 'S', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (66, 'Silvia', 'silviasof_13@hotmail.com', NULL, NULL, '$2y$12$64gv8dsy95iDCGf.LJlIBuCJR5kaZnryrWFSX.UnpyRNrnvGp1cY2', NULL, '2025-12-09 17:47:57', '2025-12-09 17:47:57', 'S', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (68, 'CAPRE', 'CAPREPERU@GMAIL.COM', 1, NULL, '$2y$12$K5r6kget5X9wVwK4GZOGTuPRQeVcguoCT15wt3BrGWgF5TWPUqxVG', NULL, '2025-12-10 21:59:50', '2025-12-10 21:59:50', 'S', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (69, 'RAJVEER', 'UPLIFTWEBDEV@GMAIL.COM', 68, NULL, '$2y$12$20kl0AbgEOj9ue50tlyubutw1w0Qv5EzPVz0UlZXxYqWyeEIZmNaa', NULL, '2025-12-11 20:43:36', '2025-12-17 00:05:27', 'S', 'avatar/1765947927.jpg', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (70, 'Miguel Inciso', 'inciso.miguel@gmail.com', NULL, NULL, '$2y$12$je5xI7JmfruyI.i/ab5qeu6uwhxZrnaI38jwXBS5zAF0DllmA94qy', NULL, '2025-12-13 15:17:18', '2025-12-13 15:17:18', 'S', 'https://lh3.googleusercontent.com/a/ACg8ocJu1xF_K4LvNybhBWjCXnFvnCV4RJqEB-2oLNaYtRnKbH_Edg=s96-c', '117909446553608620331', NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (71, 'José Morales', 'darioma777@gmail.com', NULL, NULL, '$2y$12$CMmhNBSPOxFEDC37RzOw0.Pt1rsSCqJdqY99xtLNHvB9CRX4ML93C', NULL, '2025-12-16 15:37:39', '2025-12-16 15:37:39', 'S', 'https://lh3.googleusercontent.com/a/ACg8ocK3NKDhCFw3IssTFJebSJNFNZC1R6IoupNXmo7qypWHI5YaXPJXhg=s96-c', '107587267654906907404', NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (72, 'ANGELA AGUILAR', 'geli298@hotmail.com', NULL, NULL, '$2y$12$E84r.6LHq6y/cIdIwsTP0.1m8rTVvjUSi75UKgfvR2mn6PX4opc8K', NULL, '2025-12-20 20:36:40', '2025-12-20 20:36:40', 'S', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (73, 'Maria De Los Angeles Shuña Meza', 'mariashunameza@gmail.com', NULL, NULL, '$2y$12$8APuIQhJ41UZ23L4WfZBk.RIFJWtAXdcrDOk1sdsDAUwxe49hzVy.', NULL, '2025-12-21 19:39:46', '2025-12-21 19:39:46', 'S', 'https://lh3.googleusercontent.com/a/ACg8ocJkQZu7Jd_DB2TXPQw6VWmS18lv5HK8yJzRpo-iW3zURvq0JFhOkg=s96-c', '109158822945449688635', NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (74, 'Elias Mauricio', 'elias.m.milla@gmail.com', NULL, NULL, '$2y$12$zYfmChDv0tEkiYtsk7afqOJwpd/WEAe4mtw0AxRNt9TmPq9dsOfjS', NULL, '2025-12-27 20:18:10', '2025-12-27 20:18:10', 'S', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (75, 'yaqueline campos', 'yaqueline1187@gmail.com', NULL, NULL, '$2y$12$nMhv38KXWvcBtCIntFmbZOlTQ.NyOV/0O/yNmHJAstNprkSSAbEIa', NULL, '2025-12-28 12:51:58', '2025-12-28 12:51:58', 'S', 'https://lh3.googleusercontent.com/a/ACg8ocIx5b8Y6_qV5LXvjPX2McYLU72ABT4ZO43iSxYXrJQH98LcRsbJbg=s96-c', '100135582026702305849', NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (76, 'Florcita Cueva', 'florcitacueva76@gmail.com', NULL, NULL, '$2y$12$c9p606VTWCnrE3FapSmnq.iPLopjkM61cDzFsxOZFtI98pawhdlHC', NULL, '2026-01-02 14:36:12', '2026-01-02 14:36:12', 'S', 'https://lh3.googleusercontent.com/a/ACg8ocLGyb-VaLDfPSRpQ3TbjzdzGUDSGVz_Aiv5CY1fLX0tOisC9iAz=s96-c', '109985483136341922408', NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (77, 'Yissell Maco', 'scc.ymaco@gmail.com', NULL, NULL, '$2y$12$S1y4lH4GGkYoEiisQCx4qu.R9Sq0dU7oVacVesUAOMh4L/iFSUozi', NULL, '2026-01-08 20:18:54', '2026-01-08 20:21:47', 'S', NULL, NULL, NULL, NULL, NULL, '1');
INSERT INTO `users` VALUES (78, 'Fiore', 'englishcfiorella@gmail.com', NULL, NULL, '$2y$12$lHa6/0E5As1rxLzPFtlVXeY2dw7iZTRve02S2JhvScnQFFHKWE6g6', NULL, '2026-01-14 16:07:01', '2026-01-14 16:07:22', 'S', NULL, NULL, NULL, NULL, NULL, '1');
INSERT INTO `users` VALUES (79, 'CIPCDA', 'gerencia.ciparequipa@cip.org.pe', NULL, NULL, '$2y$12$1R8YewkrKIlFFOt35G8eC.5N4gg05fHnnIPDMPoK81UX9Y7lTvIAe', NULL, '2026-01-19 12:57:44', '2026-01-19 12:58:17', 'S', NULL, NULL, NULL, NULL, NULL, '1');
INSERT INTO `users` VALUES (80, 'Caleb', 'administracion@techtractor.com.pe', NULL, NULL, '$2y$12$Eejsaf52U5sqVNfX1b5WkOEbAnnVqVyiUH4v2MWvW3V2GU48cYRx.', NULL, '2026-01-23 18:42:59', '2026-01-23 18:51:02', 'S', NULL, NULL, NULL, NULL, NULL, '1');
INSERT INTO `users` VALUES (81, 'Silvia  Morgan Morgan Castillo', 'silviaeu5518@gmail.com', NULL, NULL, '$2y$12$st3Q328tM08ogkcTUfb55eq38ryjsxr9th5DzCrkjze81ZZvAo03e', NULL, '2026-01-26 21:30:29', '2026-01-26 21:30:29', 'S', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `users` VALUES (82, 'juan123', 'bodayo1354@2insp.com', NULL, NULL, '$2y$12$nNMYBcdfc8/YRSy5B0k4cOGQCi/lsos0GNbeF9l9uhqTyq8eZoVHK', 'jDZom84kI8AD7tto41AG7mdHd9XpMfTUgO29DTwDB9sAe3Td7j7d15qvqdJD', '2026-02-10 03:53:00', '2026-02-10 03:53:00', 'S', NULL, NULL, NULL, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for users_verify
-- ----------------------------
DROP TABLE IF EXISTS `users_verify`;
CREATE TABLE `users_verify`  (
  `user_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 83 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users_verify
-- ----------------------------
INSERT INTO `users_verify` VALUES (46, 'MWE6YVIAmA3RscMdX9R0nAoOI6XOWLwSTTy7M6skRZB8d6kLPkLyVTO2pkTTT4GQ', '2025-08-17 10:20:02', '2025-08-17 10:20:02');
INSERT INTO `users_verify` VALUES (47, 'Wog4Pvz3y2YzB68CFja91Bd4OsgGPCq2NB6eq9mCoRw245Wgse4BRaS2wQIq0HpP', '2025-08-22 15:35:29', '2025-08-22 15:35:29');
INSERT INTO `users_verify` VALUES (53, '1MEfmwdn05wNqvyp8JXMhF6mKmdOUz1USz6ycsTDdUtp8SnUQisu95lxRVaSAUym', '2025-09-29 22:27:36', '2025-09-29 22:27:36');
INSERT INTO `users_verify` VALUES (54, 'lR3r4AcbHBgKYt7ybEx61Sa30c6Wwkc5kA8xwBS4kLo6U1qCADZmEEfgWorXthse', '2025-10-01 20:56:14', '2025-10-01 20:56:14');
INSERT INTO `users_verify` VALUES (55, 'XOZ79lqM5i8RP1AtoMS6uPupJOZBrEYBmS8dq9lMHv3OeeyLXr8OeXnvxcLqG59q', '2025-10-02 12:19:56', '2025-10-02 12:19:56');
INSERT INTO `users_verify` VALUES (61, 'TNAoATvHT39eiiraer7VgS18p0qUgMiCUWYuNkTyP4cLWHgscGMKhEDaGZIGZobW', '2025-11-06 19:05:57', '2025-11-06 19:05:57');
INSERT INTO `users_verify` VALUES (64, 'tJuBtGoqlN2cj5NjASROWN1gt0gja9jK5aYds15tJWbWltzW52YYSX81oxaqdLl0', '2025-12-04 15:48:06', '2025-12-04 15:48:06');
INSERT INTO `users_verify` VALUES (65, '8fjbVFqP1pfEu5MJ1lizgjq7t63jB4Jq3Y0UnOSd2JqJvbFJZcujIU6P3M1NKeKM', '2025-12-09 15:39:18', '2025-12-09 15:39:18');
INSERT INTO `users_verify` VALUES (66, 'z7nAVr4xpv0k9gQo2OxOszp9JLQkqL4xcfkLdHTwan453pbGcL1Ems8nXr6srUpH', '2025-12-09 17:47:57', '2025-12-09 17:47:57');
INSERT INTO `users_verify` VALUES (72, 'EQcnOcG5Y7wInZbUFyPtqf5R1PW3vhU8LOXngBkgqXoR8fmAbLRayXr9HI4n11tt', '2025-12-20 20:36:40', '2025-12-20 20:36:40');
INSERT INTO `users_verify` VALUES (74, 'ygJIhAvGEkMMbyFhgU0AuiaayuBg9E7KSi3VW59ZKIxoMhc5Ww6Um7iaH66PvfLl', '2025-12-27 20:18:10', '2025-12-27 20:18:10');
INSERT INTO `users_verify` VALUES (77, 'yclUqroJ0AVDp9qksvWm072z3RH7YdxAPhf271icw5OjoOcq1QpPcg8MJsUUIk4H', '2026-01-08 20:18:54', '2026-01-08 20:18:54');
INSERT INTO `users_verify` VALUES (78, 'gyilQjUBtpCpgCFHzvEzYb6eTjQDNc7tCuEctCKz5fyaHNZv7g9NFQQHfYwUEHJH', '2026-01-14 16:07:01', '2026-01-14 16:07:01');
INSERT INTO `users_verify` VALUES (79, 'jLSIx1BMnlmhijnXDyEkCxZ0fPnc7EcwSZu7NbmAHBBrsJKBp6ECZhnIys4FoXOW', '2026-01-19 12:57:44', '2026-01-19 12:57:44');
INSERT INTO `users_verify` VALUES (80, 'j9MZUpKu3lEm59u2dlGrEHqXaBHSKxF1a3md17VHgvO91LUqwwzWYUYqzWYRN7XI', '2026-01-23 18:42:59', '2026-01-23 18:42:59');
INSERT INTO `users_verify` VALUES (81, '2uW3ce0ZhsPPKS7S1YSCr4t2VJdaAcQRsIRlQTxQWL5T2nVfIrapeh9OgXW3Ogpg', '2026-01-26 21:30:29', '2026-01-26 21:30:29');
INSERT INTO `users_verify` VALUES (82, 'dxt6pgErTG49t0VDmw02E9m2AJi3mjMJ6I57O22xA0ODk8UjcBYnIrTEyPcukrV9', '2026-02-10 03:53:00', '2026-02-10 03:53:00');
 
-- ----------------------------
-- Function structure for SPLIT_STR
-- ----------------------------
DROP FUNCTION IF EXISTS `SPLIT_STR`;
delimiter ;;
CREATE FUNCTION `SPLIT_STR`(x VARCHAR(255),
  delim VARCHAR(12),
  pos INT)
 RETURNS varchar(255) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
RETURN REPLACE(SUBSTRING(SUBSTRING_INDEX(x, delim, pos),
       LENGTH(SUBSTRING_INDEX(x, delim, pos -1)) + 1),
       delim, '')
;;
delimiter ;

-- ----------------------------
-- Procedure structure for SP_ENVIOS_GET_SHIPPING_OPTIONS
-- ----------------------------
DROP PROCEDURE IF EXISTS `SP_ENVIOS_GET_SHIPPING_OPTIONS`;
delimiter ;;
CREATE PROCEDURE `SP_ENVIOS_GET_SHIPPING_OPTIONS`(IN p_department_id INT,
    IN p_district_id INT)
BEGIN
    SELECT 
        sa.id AS agency_id,
        sa.name AS agency_name,
        sc.cost,
        sc.estimated_days,
        CASE 
            WHEN sc.district_id IS NOT NULL THEN 'district'
            ELSE 'department'
        END AS coverage_level
    FROM envio_shipping_agencies sa
    JOIN envio_shipping_costs sc ON sc.shipping_agency_id = sa.id
    WHERE sc.department_id = p_department_id
      AND (sc.district_id = p_district_id OR sc.district_id IS NULL)
    ORDER BY sa.name, coverage_level DESC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_CLIENTE_LISTAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_CLIENTE_LISTAR`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_CLIENTE_LISTAR`()
BEGIN
			 
	  SELECT
				 ROW_NUMBER() OVER (ORDER BY AE.id_cliente) AS RowIndex
					,AE.id_cliente
					-- ,CONCAT(AE.nombre,' ',AE.apellido) AS nombre
				 , AE.nombre
				 , AE.apellido
				 , AE.telefono
				 , AE.email
				 , AE.direccion
				 , AE.ruc
				 , AE.razon_social
				 , AE.created_at
				 , AE.Activo
 
					
		FROM  administracion_cliente AE ORDER BY AE.id_cliente DESC;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_EMPLEADO_ACTUALIZAR_VALIDAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_EMPLEADO_ACTUALIZAR_VALIDAR`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_EMPLEADO_ACTUALIZAR_VALIDAR`(IN dni_ 						VARCHAR(255),
IN email_ 					VARCHAR(255),
IN id_empleado_ 		VARCHAR(255))
BEGIN
 
 
 DECLARE MensajeValidacion1	VARCHAR(50) DEFAULT  '';
 DECLARE MensajeValidacion2	VARCHAR(50) DEFAULT  '';
 
 DECLARE isDNI 										VARCHAR(50);
 DECLARE isDNI_TOTAL 							VARCHAR(50);
	
 DECLARE isEMAIL_EMPLEADO 				VARCHAR(50);
 DECLARE isEMAIL_EMPLEADO_TOTAL 	VARCHAR(50);
 

 SET isDNI = (SELECT dni FROM administracion_empleado   WHERE id_empleado = id_empleado_);
 SET isDNI_TOTAL = (SELECT dni FROM administracion_empleado   WHERE dni = dni_);
 
 SET isEMAIL_EMPLEADO = (SELECT email FROM administracion_empleado   WHERE id_empleado = id_empleado_);
 SET isEMAIL_EMPLEADO_TOTAL = (SELECT email FROM administracion_empleado   WHERE email = email_);
	
	# CASO 1: DNI
	IF (isDNI = dni_) THEN
		SET MensajeValidacion1 = '';
	ELSEIF (isDNI = isDNI_TOTAL) THEN
		SET MensajeValidacion1 = '';
	ELSEIF (isDNI_TOTAL IS NULL) THEN
		SET MensajeValidacion1 = '';
	ELSE
	 SET MensajeValidacion1 = 'DNI';

	END IF;
	

		# CASO 2: EMAIL
	IF (isEMAIL_EMPLEADO = email_) THEN
		SET MensajeValidacion2 = '';
	ELSEIF (isEMAIL_EMPLEADO = isEMAIL_EMPLEADO_TOTAL) THEN
		SET MensajeValidacion2 = '';
	ELSEIF (isEMAIL_EMPLEADO_TOTAL IS NULL) THEN
		SET MensajeValidacion2 = '';
	ELSE
		SET MensajeValidacion2 = 'EMAIL';
	END IF;

		# CASO 2: EMAIL
	IF (MensajeValidacion1 = 'DNI' OR MensajeValidacion2 = 'EMAIL') THEN
			SELECT CONCAT('¡El ', MensajeValidacion1,' , ',MensajeValidacion2,' ingresado ya existe!') AS MensajeValidacion;
	ELSE
		 SELECT '' AS MensajeValidacion;
	END IF;
 
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_EMPLEADO_CREAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_EMPLEADO_CREAR`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_EMPLEADO_CREAR`(IN nombre_ 							VARCHAR(255),
IN apellido_ 						VARCHAR(255),
IN telefono_ 						VARCHAR(255),
IN email_ 							VARCHAR(255),
IN direccion_						VARCHAR(255),
IN dni_ 								VARCHAR(255),
IN licencia_ 						VARCHAR(255),
IN Activo_ 							CHAR(1),

IN email_acceso_ 				VARCHAR(255),
IN password_ 	  				VARCHAR(255),
IN id_usuario_ 	  			INT)
BEGIN					


IF email_acceso_!= '' AND password_!='' THEN
		BEGIN

			INSERT INTO `users`
			 (
				 `name`
			 , `email`
			 , `id_owner`
			 ,`password`
			 
			 ,`created_at` 
			 ,`updated_at`
			 ,`Activo`) 
			 VALUES (
				nombre_
			 ,email_acceso_
			 ,id_usuario_
			 ,password_
			 
			 ,NOW()
			 ,NOW()
			 ,Activo_

			 );

		END;
		
END IF;

# 2. Obtenemos un nuevo Id para el usuario asignado si es que lo crea
INSERT INTO `administracion_empleado` 
( `nombre`, `apellido`, `telefono`, `email`, `direccion`, `dni`, `licencia`, `created_at`, `updated_at`, `Activo`,id_usuario) 
VALUES
 (
 nombre_
 ,apellido_
 ,telefono_
 ,email_
 ,direccion_
 ,dni_
 ,licencia_
 ,NOW()
 ,NOW()
 ,Activo_
 ,LAST_INSERT_ID()
 );


						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_EMPLEADO_CREAR_VALIDAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_EMPLEADO_CREAR_VALIDAR`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_EMPLEADO_CREAR_VALIDAR`(IN dni_ 						VARCHAR(255),
IN email_acceso_ 		VARCHAR(255),
IN email_ 					VARCHAR(255))
BEGIN
 
 
 DECLARE MensajeValidacion VARCHAR(50) DEFAULT  '';
      
 IF EXISTS ( SELECT (1) FROM administracion_empleado   WHERE dni = dni_ ) THEN
    BEGIN      
			SET MensajeValidacion = '¡El DNI ingresado ya existe!';
		END;
 END IF;
 
  IF EXISTS ( SELECT (1) FROM administracion_empleado   WHERE email COLLATE utf8mb4_unicode_ci = email_ ) THEN
    BEGIN      
			SET MensajeValidacion = '¡El EMAIL Empleado, ingresado ya existe!';
		END;
 END IF;
 
  IF EXISTS ( SELECT (1) FROM users   WHERE email  COLLATE utf8mb4_unicode_ci = email_acceso_ ) THEN
    BEGIN      
			SET MensajeValidacion = '¡El EMAIL ingresado ya existe!';
		END;
 END IF;
 
 SELECT MensajeValidacion AS MensajeValidacion;
 
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_EMPLEADO_LISTAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_EMPLEADO_LISTAR`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_EMPLEADO_LISTAR`()
BEGIN
			 
	  SELECT
				 ROW_NUMBER() OVER (ORDER BY AE.id_empleado) AS RowIndex				
				,AE.id_empleado
				,AE.nombre
				,AE.apellido
				,AE.telefono
				,AE.email
				,AE.direccion
				,AE.dni
				,AE.created_at
				,AE.Activo
				,AE.id_usuario
				,U.name AS nombre_usuario
				,AE.licencia
				,CONCAT(AE.nombre,' , ',AE.apellido) AS nombre_apellido

		FROM  administracion_empleado AE LEFT JOIN users U ON AE.id_usuario = U.id
		
		 ORDER BY AE.id_empleado DESC;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_PERFIL_LISTAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_PERFIL_LISTAR`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_PERFIL_LISTAR`(IN id_usuario_ INT)
BEGIN
			--  El campos esta formado por esta estructura
			-- |1-1,2,3|,|1-0|: |id_menus, id_objetos...|
			
	WITH perfil as (
	
				SELECT
				 
						SPU.id_usuario
						,U.name AS nombre_usuario
						,U.email
						,SP.nombre AS nombre_perfil
						,SP.id_perfil
						,SRP.id_roles
						,SM.id_menu
						,SM.IdObjeto AS id_objetos
					 -- ,CASE WHEN SM.IdObjeto!='' THEN SM.IdObjeto ELSE 0 END AS id_objetos
					 
					FROM users U 
						INNER JOIN seguridad_perfil_users SPU ON U.id=SPU.id_usuario
						INNER JOIN seguridad_perfil SP ON SPU.id_perfil=SP.id_perfil
						INNER JOIN seguridad_roles_perfil SRP ON SPU.id_perfil=SRP.id_perfil

						INNER JOIN seguridad_roles_menu SRM ON SRP.id_roles=SRM.id_roles
						INNER JOIN datatreeview SM ON SRM.id_menu=SM.IdMenu

			WHERE SPU.id_usuario=id_usuario_ AND SM.IdObjeto!=''
					ORDER BY SP.id_perfil ASC
					),
		resultado AS (
	SELECT
			`id_usuario`
			, `nombre_usuario`
			, `email`
			, `nombre_perfil`
			, `id_perfil`
			, `id_roles`
			,CONCAT('|',id_menu,'_',GROUP_CONCAT(DISTINCT  id_objetos  ORDER BY id_objetos ASC SEPARATOR ','),'|') AS permisos
			-- ,id_menu
			-- , GROUP_CONCAT(DISTINCT id_menu SEPARATOR ',') AS id_menu
			-- , GROUP_CONCAT(DISTINCT  id_objetos  ORDER BY id_objetos ASC SEPARATOR ',') AS id_objetos
	FROM perfil  
		GROUP BY 
		`id_usuario`
		, `nombre_usuario`
		, `email`
		, `nombre_perfil`
		, `id_perfil`
		, `id_roles`
  ,id_menu
 )
 SELECT
			`id_usuario`
			, `nombre_usuario`
			, `email`
			, `nombre_perfil`
			, `id_perfil`
			, `id_roles`
 
			,GROUP_CONCAT(DISTINCT  permisos  ORDER BY permisos ASC SEPARATOR '-') AS menu_objetos
 
 FROM resultado
 
 GROUP BY 
		`id_usuario`
		, `nombre_usuario`
		, `email`
		, `nombre_perfil`
		, `id_perfil`
		, `id_roles`;
				
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_PERFIL_LISTAR_LOGIN
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_PERFIL_LISTAR_LOGIN`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_PERFIL_LISTAR_LOGIN`(IN p_id_usuario INT,
    IN p_id_perfil INT,
    IN p_id_roles INT)
BEGIN
    -- Propósito: Lista los menús y objetos asociados a un usuario, perfil y rol específicos.
    -- Parámetros:
    --   p_id_usuario: ID del usuario (obligatorio).
    --   p_id_perfil: ID del perfil (opcional, puede ser NULL).
    --   p_id_roles: ID del rol (opcional, puede ser NULL).
    -- Formato de salida: |id_menu_id_objeto1,id_objeto2,...|-|id_menu_id_objetoA,id_objetoB,...|

    DECLARE v_clausula_where TEXT DEFAULT '';
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error al ejecutar la consulta dinámica';
    END;

    -- Validar que p_id_usuario no sea NULL
    IF p_id_usuario IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El parámetro p_id_usuario no puede ser NULL';
    END IF;

    -- Construir cláusula WHERE dinámica
    IF p_id_perfil IS NOT NULL AND p_id_roles IS NOT NULL THEN
        SET v_clausula_where = CONCAT('AND SP.id_perfil = ', QUOTE(p_id_perfil), ' AND SRP.id_roles = ', QUOTE(p_id_roles));
    END IF;

    -- Construir la consulta SQL dinámica
    SET @sql = CONCAT('
        WITH perfil AS (
            SELECT
                SPU.id_usuario,
                U.name AS nombre_usuario,
                U.email,
                SP.nombre AS nombre_perfil,
                SP.id_perfil,
                SRP.id_roles,
                SM.id_menu,
                SM.IdObjeto AS id_objetos
            FROM users U
            INNER JOIN seguridad_perfil_users SPU ON U.id = SPU.id_usuario
            INNER JOIN seguridad_perfil SP ON SPU.id_perfil = SP.id_perfil
            INNER JOIN seguridad_roles_perfil SRP ON SPU.id_perfil = SRP.id_perfil
            INNER JOIN seguridad_roles_menu SRM ON SRP.id_roles = SRM.id_roles
            INNER JOIN datatreeview SM ON SRM.id_menu = SM.IdMenu
            WHERE
                SPU.id_usuario = ', QUOTE(p_id_usuario), '
                AND SM.IdObjeto IS NOT NULL
                ', v_clausula_where, '
            ORDER BY
                SP.id_perfil ASC
        ),
        resultado AS (
            SELECT
                id_usuario,
                nombre_usuario,
                email,
                nombre_perfil,
                id_perfil,
                id_roles,
                CONCAT(''|'', id_menu, ''_'', GROUP_CONCAT(DISTINCT id_objetos ORDER BY id_objetos ASC SEPARATOR '',''), ''|'') AS permisos
            FROM perfil
            GROUP BY
                id_usuario,
                nombre_usuario,
                email,
                nombre_perfil,
                id_perfil,
                id_roles,
                id_menu
        )
        SELECT
            id_usuario,
            nombre_usuario,
            email,
            nombre_perfil,
            id_perfil,
            id_roles,
            GROUP_CONCAT(DISTINCT permisos ORDER BY permisos ASC SEPARATOR ''-'') AS menu_objetos
        FROM resultado
        GROUP BY
            id_usuario,
            nombre_usuario,
            email,
            nombre_perfil,
            id_perfil,
            id_roles;
    ');

    -- Ejecutar la consulta dinámica
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_PRODUCTO_CATEGORIA_LISTAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_PRODUCTO_CATEGORIA_LISTAR`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_PRODUCTO_CATEGORIA_LISTAR`()
BEGIN
			 
	  SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_producto_categoria) AS RowIndex
				 , AE.id_producto_categoria
				 , AE.nombre
				 , AE.created_at
				 , AE.Activo
 
					
		FROM  administracion_producto_categoria AE ORDER BY AE.id_producto_categoria DESC;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_PRODUCTO_CATEGORIA_SUB_LISTAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_PRODUCTO_CATEGORIA_SUB_LISTAR`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_PRODUCTO_CATEGORIA_SUB_LISTAR`()
BEGIN
			 
	  SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_producto_categoria_sub) AS RowIndex
				 , AE.id_producto_categoria_sub
				 , AE.id_producto_categoria
				 , AE.nombre
				 , AE.created_at
				 , AE.Activo
 
					
		FROM  administracion_producto_categoria_sub AE ORDER BY AE.id_producto_categoria_sub DESC;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_PRODUCTO_CATEGORIA_SUB_LISTAR_OBTENER
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_PRODUCTO_CATEGORIA_SUB_LISTAR_OBTENER`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_PRODUCTO_CATEGORIA_SUB_LISTAR_OBTENER`(IN id_producto_categoria_ INT)
BEGIN
			 
	  SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_producto_categoria_sub) AS RowIndex
				 , AE.id_producto_categoria_sub
				 , AE.id_producto_categoria
				 , AE.nombre
				 , AE.created_at
				 , AE.Activo
 
					
		FROM  administracion_producto_categoria_sub AE 
		WHERE  AE.id_producto_categoria = id_producto_categoria_
		ORDER BY AE.id_producto_categoria_sub DESC;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_PRODUCTO_CREAR_FOTOS
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_PRODUCTO_CREAR_FOTOS`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_PRODUCTO_CREAR_FOTOS`(IN id_producto_ 				VARCHAR(255),
IN url_imagen_ 					VARCHAR(255))
BEGIN

DECLARE next_order_number INT;

 SELECT COUNT(*) + 1 INTO next_order_number FROM administracion_producto_fotos WHERE id_producto=id_producto_;
 
 INSERT INTO administracion_producto_fotos( `id_producto`, `url_imagen`, `orden`) 
 VALUES (id_producto_, url_imagen_,next_order_number);
		
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_PRODUCTO_CREAR_IMAGEN
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_PRODUCTO_CREAR_IMAGEN`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_PRODUCTO_CREAR_IMAGEN`(IN id_producto_ VARCHAR ( 255 ),
	IN url_imagen_ VARCHAR ( 255 ),
	IN Activo_ CHAR ( 1 ),
	IN titulo_ VARCHAR ( 255 ),
	IN precio_ VARCHAR ( 255 ),
	IN descripcion_ TEXT,
	IN codigo_producto_ VARCHAR ( 255 ),
	IN stock_ VARCHAR ( 255 ),
	IN precio_old_ VARCHAR ( 255 ),
	IN peso_kilogramo_ VARCHAR ( 255 ),
	IN corte_tiempo_promocion_ VARCHAR ( 255 ),
	IN corte_tiempo_sabado_ VARCHAR ( 255 ),
	IN numero_estrellas_ VARCHAR ( 255 ),
	IN precio_yape_ VARCHAR ( 255 ))
BEGIN
	DECLARE
		next_order_number INT;
	SELECT
		COUNT(*) + 1 INTO next_order_number 
	FROM
		administracion_producto_imagen 
	WHERE
		id_producto = id_producto_;
	INSERT INTO `administracion_producto_imagen` (
		`id_producto`,
		`url_imagen`,
		`orden`,
		`Activo`,
		`created_at`,
		titulo,
		precio,
		descripcion,
		codigo_producto,
		stock,
		precio_old,
		peso_kilogramo,
		numero_estrellas,
		corte_tiempo_promocion,
		corte_tiempo_sabado,
		precio_yape 
	)
	VALUES
		(
			id_producto_,
			url_imagen_,
			next_order_number,
			Activo_,
			NOW(),
			titulo_,
			precio_,
			descripcion_,
			codigo_producto_,
			stock_,
			precio_old_,
			peso_kilogramo_,
			numero_estrellas_,
			corte_tiempo_promocion_,
			corte_tiempo_sabado_,
			precio_yape_ 
		);

END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_PRODUCTO_LISTAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_PRODUCTO_LISTAR`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_PRODUCTO_LISTAR`()
BEGIN
			 
	  SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_producto) AS RowIndex
					,AE.id_producto
					,AE.codigo_producto
				 , AE.nombre
				 , AE.descripcion
				 , AE.precio
				 , AE.stock
				 , AE.url_imagen

				 , AE.created_at
				 , AE.Activo
				 ,APC.nombre AS nombre_categoria
 
					
		FROM  administracion_producto AE INNER JOIN administracion_producto_categoria APC ON AE.id_producto_categoria=APC.id_producto_categoria
		
		ORDER BY AE.id_producto DESC;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_PRODUCTO_LISTAR_FILTRO
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_PRODUCTO_LISTAR_FILTRO`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_PRODUCTO_LISTAR_FILTRO`(IN id_producto_tipo_ INT)
BEGIN
    -- Variables para condiciones dinámicas
    DECLARE where_condition VARCHAR(1000) DEFAULT '';
    DECLARE order_condition VARCHAR(255) DEFAULT 'AE.id_producto DESC';
    DECLARE tipo_producto VARCHAR(50) DEFAULT 'Todos';
    
    -- Configurar condiciones según el tipo
    IF id_producto_tipo_ = 1 THEN
				#SET where_condition = 'WHERE AE.id_producto_tipo = 1 AND AE.Activo = 1';
        SET where_condition = 'WHERE AE.id_producto_tipo = 1';
        SET order_condition = 'AE.id_producto DESC';
        SET tipo_producto = 'Tipo 1';
    ELSEIF id_producto_tipo_ = 2 THEN
        #SET where_condition = 'WHERE AE.id_producto_tipo = 2 AND AE.stock > 0';
				SET where_condition = 'WHERE AE.id_producto_tipo = 2 ';
        SET order_condition = 'AE.id_producto DESC';
        SET tipo_producto = 'Tipo 2';
    ELSEIF id_producto_tipo_ != 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Valor de id_producto_tipo_ no válido. Use 0, 1 o 2.';
    END IF;
    
    -- Consulta única con condiciones dinámicas
    SET @sql = CONCAT('
        SELECT
            ROW_NUMBER() OVER (ORDER BY ', order_condition, ') AS RowIndex,
            AE.id_producto,
            AE.codigo_producto,
            AE.nombre,
            AE.descripcion,
            AE.precio,
            AE.stock,
            AE.url_imagen,
            AE.created_at,
            AE.Activo,
            APC.nombre AS nombre_categoria,
            ''', tipo_producto, ''' AS tipo_producto,
            CONCAT(''$'', FORMAT(AE.precio, 2)) AS precio_formateado
        FROM 
            administracion_producto AE 
            INNER JOIN administracion_producto_categoria APC ON AE.id_producto_categoria = APC.id_producto_categoria
        ', where_condition, '
        ORDER BY ', order_condition
    );
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_PRODUCTO_LISTAR_FOTOS
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_PRODUCTO_LISTAR_FOTOS`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_PRODUCTO_LISTAR_FOTOS`(IN id_producto_ 	INT)
BEGIN
			 
	  SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_producto_foto) AS RowIndex
				 , AE.id_producto_foto
				 , AE.id_producto
				 , AE.url_imagen
				 , AE.orden
 
		FROM  administracion_producto_fotos AE  WHERE AE.id_producto=id_producto_ ORDER BY AE.orden ASC;
		
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_PRODUCTO_LISTAR_IMAGEN
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_PRODUCTO_LISTAR_IMAGEN`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_PRODUCTO_LISTAR_IMAGEN`(IN id_producto_ 	INT)
BEGIN
			 
	  SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_producto_imagen) AS RowIndex
				 , AE.id_producto_imagen
				 , AE.id_producto
				 , AE.url_imagen
				 , AE.orden
				 , AE.Activo
				 
				 , AE.precio
				 , AE.titulo
				 , AE.descripcion
				 , AE.stock
 
		FROM  administracion_producto_imagen AE  WHERE AE.id_producto=id_producto_ ORDER BY AE.orden ASC;
		-- INNER JOIN administracion_producto AP ON AE.id_producto=AP.id_producto
		
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_ADMINISTRACION_PRODUCTO_OBTENER_DIMENSION
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_ADMINISTRACION_PRODUCTO_OBTENER_DIMENSION`;
delimiter ;;
CREATE PROCEDURE `USP_ADMINISTRACION_PRODUCTO_OBTENER_DIMENSION`()
BEGIN
	SELECT
	 DISTINCT	A.paquete_medidas 
	FROM
		oferta_precios_peso A 
	ORDER BY
		A.paquete_medidas DESC;

END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_GESTION_PRECIOS_PESO
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_GESTION_PRECIOS_PESO`;
delimiter ;;
CREATE PROCEDURE `USP_GESTION_PRECIOS_PESO`(IN p_accion VARCHAR(10),
    IN p_id INT,
    IN p_rango_min DECIMAL(10,3),
    IN p_rango_max DECIMAL(10,3),
    IN p_precio DECIMAL(10,2),
    IN p_activo TINYINT)
BEGIN
    IF p_accion = 'INSERT' THEN
        INSERT INTO precios_peso (rango_min, rango_max, precio, activo)
        VALUES (p_rango_min, p_rango_max, p_precio, p_activo);
    ELSEIF p_accion = 'UPDATE' THEN
        UPDATE precios_peso 
        SET rango_min = p_rango_min,
            rango_max = p_rango_max,
            precio = p_precio,
            activo = p_activo
        WHERE id = p_id;
    ELSEIF p_accion = 'DELETE' THEN
        DELETE FROM precios_peso WHERE id = p_id;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_OPE_PEDIDOS_LISTAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_OPE_PEDIDOS_LISTAR`;
delimiter ;;
CREATE PROCEDURE `USP_OPE_PEDIDOS_LISTAR`()
BEGIN

		SELECT
						ROW_NUMBER() OVER (ORDER BY AE.id_pedido) AS RowIndex
					, AE.id_pedido
					, AE.created_at
					, AE.codigo_pedido
					-- , CONCAT(AC.nombre,' ',AC.apellido) AS cliente_nombre
					, CASE WHEN AC.nombre IS NULL THEN US.`name` ELSE  CONCAT(AC.nombre,' ',AC.apellido) END  AS cliente_nombre
					-- , CONCAT(AE.direccion_envio_nombre,' ',AE.direccion_envio_apellido) AS envio_nombre
					, AE.direccion_envio_ubicacion
					, SUM(OPP.pro_cantidad) AS pro_cantidad
					, SUM(OPP.pro_precio*OPP.pro_cantidad) AS pro_total
					
					/*
					, AE.id_cliente
					, AE.metodo_pago
					, AE.metodo_envio
					, AE.direccion_envio_correo
					, AE.direccion_envio_dni
					, AE.direccion_envio_ruc
					, AE.direccion_envio_pais
					, AE.direccion_envio_ciudad
					, AE.direccion_envio_distrito
					, AE.estado
					-- , AE.updated_at
					-- , AE.Activo
				 , OPP.id_pedido_producto
				 , OPP.pro_nombre
				 , OPP.pro_descripcion
				 , OPP.pro_url_imagen
				 */
					
			FROM  ope_pedidos AE 
			INNER JOIN ope_pedidos_producto  OPP ON AE.id_pedido= OPP.id_pedido
			INNER JOIN administracion_cliente  AC ON AE.id_cliente= AC.id_cliente
			LEFT JOIN users  US ON AC.id_usuario= US.id
			-- WHERE AE.estado=5
			GROUP BY AE.id_pedido ORDER BY AE.id_pedido  DESC;
		
 
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_OPE_PEDIDOS_LISTAR_FACTURA
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_OPE_PEDIDOS_LISTAR_FACTURA`;
delimiter ;;
CREATE PROCEDURE `USP_OPE_PEDIDOS_LISTAR_FACTURA`()
BEGIN

		WITH lista_sumario_pedido AS (

			SELECT
			   AE.id_pedido
			 , SUM(OPP.pro_precio*OPP.pro_cantidad) AS pro_subtotal
			 , SUM(OPP.pro_precio*OPP.pro_cantidad) AS pro_total
			 , '0.00' AS pro_descuento
			 , '0.00' AS pro_descuento_cupon
			 , '0.00' AS pro_igv
			 , '0.00' AS pro_igv_sin
			 , '0.00' AS pro_costo_envio
			FROM  ope_pedidos AE 
			INNER JOIN ope_pedidos_producto  OPP ON AE.id_pedido= OPP.id_pedido
			-- WHERE AE.id_pedido=id_pedido_
			GROUP BY AE.id_pedido
			
		)

		SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_pedido) AS RowIndex
				  , AE.id_pedido
					/*
				  , OPP.pro_nombre
				  , OPP.pro_precio
				  , OPP.pro_cantidad
				  , OPP.pro_url_imagen
					
					*/
					, AE.created_at
					, AE.codigo_pedido
					, AE.codigo_boleta_o_factura
					/*
					, AE.id_cliente
					, AE.metodo_pago
					, AE.metodo_envio
					*/
					, CONCAT(AC.nombre,' ',AC.apellido) AS cliente_nombre
					/*
					, CONCAT(AE.direccion_envio_nombre,' ',AE.direccion_envio_apellido) AS envio_nombre
					, AE.direccion_envio_correo
					*/
					, AE.direccion_envio_ubicacion
					/*
					, AE.direccion_envio_dni
					, AE.direccion_envio_ruc
					, AE.direccion_envio_pais
					, AE.direccion_envio_ciudad
					, AE.direccion_envio_distrito
					, AE.estado
					*/
					
					,SP.*
					 				
			FROM  ope_pedidos AE 
			INNER JOIN ope_pedidos_producto  OPP ON AE.id_pedido= OPP.id_pedido
			INNER JOIN administracion_cliente  AC ON AE.id_cliente= AC.id_cliente
			INNER JOIN users  US ON AC.id_cliente= US.id
			LEFT JOIN lista_sumario_pedido SP ON AE.id_pedido= SP.id_pedido
			
			WHERE AE.estado=5 # 5= Entregado
			GROUP BY AE.id_pedido
			ORDER BY AE.id_pedido  DESC;
 
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_OPE_PEDIDOS_LISTAR_FILTRAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_OPE_PEDIDOS_LISTAR_FILTRAR`;
delimiter ;;
CREATE PROCEDURE `USP_OPE_PEDIDOS_LISTAR_FILTRAR`(IN estado_ INT,
    IN fecha_desde DATE,
    IN fecha_hasta DATE)
BEGIN
    -- Declarar variable para lista de estados
    DECLARE estado_lista VARCHAR(50);
    
    -- Validar fechas (si no se proporcionan, usar rangos extremos)
    IF fecha_desde IS NULL THEN
        SET fecha_desde = '1900-01-01';
    END IF;
    
    IF fecha_hasta IS NULL THEN
        SET fecha_hasta = '2999-12-31';
    END IF;
    
    -- Determinar lista de estados según el parámetro
    IF estado_ IN (1, 2, 3) THEN
        SET estado_lista = '1,2,3';
    ELSEIF estado_ IN (6, 7) THEN
        SET estado_lista = '6,7';
    ELSE
        SET estado_lista = CAST(estado_ AS CHAR);
    END IF;
    
    -- Consulta principal con mejoras
    SET @sql = CONCAT('
        SELECT
            ROW_NUMBER() OVER (ORDER BY AE.id_pedido DESC) AS RowIndex,
            AE.id_pedido,
            DATE_FORMAT(AE.created_at, ''%Y-%m-%d %H:%i:%s'') AS created_at,
            AE.codigo_pedido,
            CASE 
                WHEN AC.nombre IS NULL THEN US.`name` 
                ELSE CONCAT(AC.nombre, '' '', AC.apellido) 
            END AS cliente_nombre,
            AE.direccion_envio_ubicacion,
            SUM(OPP.pro_cantidad) AS pro_cantidad,
            SUM(OPP.pro_precio * OPP.pro_cantidad) AS pro_total,
            CASE 
                WHEN AE.estado  = 1 THEN ''Pendiente''
								 WHEN AE.estado  = 2 THEN ''En preparación''
								  WHEN AE.estado  = 3 THEN ''Empaquetando''
                WHEN AE.estado = 4 THEN ''En camino''
                WHEN AE.estado = 5 THEN ''Entregado''
                WHEN AE.estado IN (6, 7) THEN ''Cancelado''
                ELSE ''Desconocido''
            END AS estado_descripcion
        FROM ope_pedidos AE 
        INNER JOIN ope_pedidos_producto OPP ON AE.id_pedido = OPP.id_pedido
        LEFT JOIN administracion_cliente AC ON AE.id_cliente = AC.id_cliente
        LEFT JOIN users US ON AC.id_usuario = US.id
        WHERE 
				-- AE.estado IN (', estado_lista, ') AND 
				DATE(AE.created_at) BETWEEN ''', fecha_desde, ''' AND ''', fecha_hasta, '''
          -- AND AE.deleted_at IS NULL
        GROUP BY AE.id_pedido, AE.created_at, AE.codigo_pedido, cliente_nombre, 
                 AE.direccion_envio_ubicacion, AE.estado
        ORDER BY AE.id_pedido DESC');
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    -- Obtener contadores por estado (información adicional completa)
    SELECT 
        COUNT(CASE WHEN estado IN (1, 2, 3) THEN 1 END) AS total_pendientes,
        COUNT(CASE WHEN estado = 4 THEN 1 END) AS total_deliverys,
        COUNT(CASE WHEN estado = 5 THEN 1 END) AS total_entregados,
        COUNT(CASE WHEN estado IN (6, 7) THEN 1 END) AS total_cancelados,
        COUNT(CASE WHEN estado NOT IN (1, 2, 3, 4, 5, 6, 7) THEN 1 END) AS total_desconocidos,
        COUNT(*) AS total_general,
        
        -- Contadores específicos para cada estado individual
        COUNT(CASE WHEN estado = 1 THEN 1 END) AS total_estado_1,
        COUNT(CASE WHEN estado = 2 THEN 1 END) AS total_estado_2,
        COUNT(CASE WHEN estado = 3 THEN 1 END) AS total_estado_3,
        COUNT(CASE WHEN estado = 4 THEN 1 END) AS total_estado_4,
        COUNT(CASE WHEN estado = 5 THEN 1 END) AS total_estado_5,
        COUNT(CASE WHEN estado = 6 THEN 1 END) AS total_estado_6,
        COUNT(CASE WHEN estado = 7 THEN 1 END) AS total_estado_7,
        
        -- Porcentajes
        ROUND(COUNT(CASE WHEN estado IN (1, 2, 3) THEN 1 END) * 100.0 / COUNT(*), 2) AS porcentaje_pendientes,
        ROUND(COUNT(CASE WHEN estado = 4 THEN 1 END) * 100.0 / COUNT(*), 2) AS porcentaje_deliverys,
        ROUND(COUNT(CASE WHEN estado = 5 THEN 1 END) * 100.0 / COUNT(*), 2) AS porcentaje_entregados,
        ROUND(COUNT(CASE WHEN estado IN (6, 7) THEN 1 END) * 100.0 / COUNT(*), 2) AS porcentaje_cancelados
    FROM ope_pedidos
    WHERE 
        -- deleted_at IS NULL AND 
        DATE(created_at) BETWEEN fecha_desde AND fecha_hasta;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_OPE_PEDIDOS_OBTENER
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_OPE_PEDIDOS_OBTENER`;
delimiter ;;
CREATE PROCEDURE `USP_OPE_PEDIDOS_OBTENER`(IN id_pedido_ 			 INT)
BEGIN

		WITH lista_sumario_pedido AS (

			SELECT
			   AE.id_pedido
			 , SUM(OPP.pro_precio*OPP.pro_cantidad) AS pro_subtotal
			 , SUM(OPP.pro_precio*OPP.pro_cantidad) AS pro_total
			 , '0.00' AS pro_descuento
			 , '0.00' AS pro_descuento_cupon
			 , '0.00' AS pro_igv
			 , '0.00' AS pro_igv_sin
			 , '0.00' AS pro_costo_envio
			FROM  ope_pedidos AE 
			INNER JOIN ope_pedidos_producto  OPP ON AE.id_pedido= OPP.id_pedido
			WHERE AE.id_pedido=id_pedido_
			GROUP BY AE.id_pedido
			
		)

		SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_pedido) AS RowIndex
				  , AE.id_pedido
				  , OPP.pro_nombre
				  , OPP.pro_precio
				  , OPP.pro_cantidad
				  , OPP.pro_url_imagen
					, AE.created_at
					, AE.codigo_pedido
					, AE.codigo_boleta_o_factura
					, AE.id_cliente
					, AE.metodo_pago
					, AE.metodo_envio
					, CONCAT(AC.nombre,' ',AC.apellido) AS cliente_nombre
					, CONCAT(AE.direccion_envio_nombre,' ',AE.direccion_envio_apellido) AS envio_nombre
					, AE.direccion_envio_correo
					, AE.direccion_envio_telefono
					, AE.direccion_envio_ubicacion
					, AE.direccion_envio_dni
					, AE.direccion_envio_ruc
					, AE.direccion_envio_pais
					, AE.direccion_envio_ciudad
					, AE.direccion_envio_provincia
					, AE.direccion_envio_distrito
					, AE.radio_metodo_pago
					, AE.radio_tipo_pago
					, AE.estado
					, AE.devolucion
					

					, AE.subido_comprobante_url
					, AE.subido_comprobante_estatus
					, AE.subido_comprobante_fecha
					, AE.comprobante_conforme
					
					,SP.*
					 				
			FROM  ope_pedidos AE 
			INNER JOIN ope_pedidos_producto  OPP ON AE.id_pedido= OPP.id_pedido
			LEFT JOIN administracion_cliente  AC ON AE.id_cliente= AC.id_cliente
			LEFT JOIN users  US ON AC.id_cliente= US.id
			LEFT JOIN lista_sumario_pedido SP ON AE.id_pedido= SP.id_pedido
			
			WHERE AE.id_pedido=id_pedido_
			ORDER BY AE.id_pedido  DESC;
 
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_SEGURIDAD_PERFIL_ASIGNAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_SEGURIDAD_PERFIL_ASIGNAR`;
delimiter ;;
CREATE PROCEDURE `USP_SEGURIDAD_PERFIL_ASIGNAR`(IN id_usuario_ 					INT,
IN cadena_id_perfil 		TEXT)
BEGIN
-- Referencia: getUpdateWUfromVRFILE
 DECLARE count INT Default 0 ;
 DECLARE valor1_ VARCHAR(255);
 
			
 read_loop: LOOP
         SET count	 = count+1;
         SET valor1_ = SPLIT_STR(cadena_id_perfil,"|",count);
				 
         IF valor1_ ='' THEN
            LEAVE read_loop;
         END IF;

				 INSERT INTO `seguridad_perfil_users` (`id_usuario`, `id_perfil`, `created_at`) VALUES (id_usuario_,valor1_,NOW());
			 
 END LOOP read_loop;
 
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_SEGURIDAD_PERFIL_ELIMINAR_MULTIPLE
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_SEGURIDAD_PERFIL_ELIMINAR_MULTIPLE`;
delimiter ;;
CREATE PROCEDURE `USP_SEGURIDAD_PERFIL_ELIMINAR_MULTIPLE`(IN cadena_id_perfil 		TEXT)
BEGIN
-- Referencia: getUpdateWUfromVRFILE
 DECLARE count INT Default 0 ;
 DECLARE valor1_ VARCHAR(255);
 
			
 read_loop: LOOP
         SET count	 = count+1;
         SET valor1_ = SPLIT_STR(cadena_id_perfil,"|",count);
				 
         IF valor1_ ='' THEN
            LEAVE read_loop;
         END IF;

				 DELETE FROM `seguridad_perfil_users` WHERE id_perfil_users = valor1_;
			 
 END LOOP read_loop;
 
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_SEGURIDAD_PERFIL_LISTAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_SEGURIDAD_PERFIL_LISTAR`;
delimiter ;;
CREATE PROCEDURE `USP_SEGURIDAD_PERFIL_LISTAR`()
BEGIN
		 
		SELECT 
				ROW_NUMBER() OVER (ORDER BY DM.id_perfil) AS RowIndex
				,DM.id_perfil
				,DM.nombre
				,DM.created_at
				,DM.Activo
		FROM seguridad_perfil DM;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_SEGURIDAD_PERFIL_MENU_LISTAR_TREEVIEW
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_SEGURIDAD_PERFIL_MENU_LISTAR_TREEVIEW`;
delimiter ;;
CREATE PROCEDURE `USP_SEGURIDAD_PERFIL_MENU_LISTAR_TREEVIEW`(IN p_id_roles INT)
BEGIN
  DECLARE v_id_roles INT DEFAULT NULL;

  SET v_id_roles = NULLIF(p_id_roles, 0);

  DELETE FROM datatreeview;

  -- NIVEL 0: Módulos (padre de menús)
  INSERT INTO datatreeview (IdMenu, IdMenuPadre, id_menu, Menu, Icon, Nivel, Orden, Activo, selected, Expanded, Tipo)
  SELECT
    CONCAT('m', SM.id_modulo) AS IdMenu,
    NULL AS IdMenuPadre,
    NULL AS id_menu,
    SM.nombre AS Menu,
    COALESCE(SM.Icon, 'folder') AS Icon,
    0 AS Nivel,
    0 AS Orden,
    COALESCE(SM.Activo, 'S') AS Activo,
    0 AS selected,
    1 AS Expanded,
    'modulo'
  FROM sistema_modulo SM
  WHERE SM.Activo = 'S' OR SM.Activo IS NULL;

  -- NIVEL 1: Menús (hijos de módulo)
  INSERT INTO datatreeview (IdMenu, IdMenuPadre, id_menu, Menu, Icon, Nivel, Orden, Activo, selected, Expanded, Tipo)
  SELECT
    CONCAT('m', SME.id_menu) AS IdMenu,
    CONCAT('m', SME.id_modulo) AS IdMenuPadre,
    SME.id_menu,
    SME.nombre AS Menu,
    'activefolder' AS Icon,
    1 AS Nivel,
    0 AS Orden,
    COALESCE(SME.Activo, 'S') AS Activo,
    CASE WHEN v_id_roles IS NOT NULL AND EXISTS (
      SELECT 1 FROM seguridad_roles_menu SRM
      WHERE SRM.id_roles = v_id_roles AND SRM.id_menu = SME.id_menu
    ) THEN 1 ELSE 0 END AS selected,
    1 AS Expanded,
    'menu'
  FROM sistema_menu SME
  WHERE SME.id_modulo IS NOT NULL
    AND (SME.Activo = 'S' OR SME.Activo IS NULL);

  -- NIVEL 2: Objetos (hijos de menú)
  INSERT INTO datatreeview (IdMenu, IdMenuPadre, id_menu, id_menu_objetos, IdObjeto, Menu, Icon, Nivel, Orden, Activo, selected, Expanded, Tipo)
  SELECT
    CONCAT('o', SMO.id_menu_objetos) AS IdMenu,
    CONCAT('m', SMO.id_menu) AS IdMenuPadre,
    SMO.id_menu,
    SMO.id_menu_objetos,
    SMO.id_objetos AS IdObjeto,
    COALESCE(SO.nombre, 'Sin nombre') AS Menu,
    'bullet' AS Icon,
    2 AS Nivel,
    0 AS Orden,
    COALESCE(SMO.Activo, 'S') AS Activo,
    CASE WHEN v_id_roles IS NOT NULL AND EXISTS (
      SELECT 1 FROM seguridad_menu_objetos_roles SMOR
      WHERE SMOR.id_roles = v_id_roles AND SMOR.id_menu_objetos = SMO.id_menu_objetos
    ) THEN 1 ELSE 0 END AS selected,
    0 AS Expanded,
    'objeto'
  FROM sistema_menu_objetos SMO
  LEFT JOIN sistema_objetos SO ON SO.id_objetos = SMO.id_objetos
  WHERE (SMO.Activo = 'S' OR SMO.Activo IS NULL);

  -- Resultado: mismo formato que antes para compatibilidad con el front
  SELECT
    TD.IdMenu,
    TD.IdMenuPadre,
    TD.id_menu,
    TD.id_menu_objetos,
    TD.IdObjeto,
    TD.Menu AS Nombre,
    TD.Menu,
    TD.Icon AS Icono,
    TD.Icon,
    TD.Nivel,
    TD.Orden,
    TD.selected,
    TD.Expanded,
    TD.Activo,
    TD.Tipo
  FROM datatreeview TD
  WHERE TD.Menu IS NOT NULL AND TD.Menu <> ''
  ORDER BY TD.Nivel, TD.Orden, TD.Menu;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_SEGURIDAD_PERFIL_OBTENER_CHECK
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_SEGURIDAD_PERFIL_OBTENER_CHECK`;
delimiter ;;
CREATE PROCEDURE `USP_SEGURIDAD_PERFIL_OBTENER_CHECK`(IN id_usuario_ 					INT)
BEGIN
		 
		SELECT 
				ROW_NUMBER() OVER (ORDER BY DM.id_perfil) AS RowIndex
				,DM.id_perfil
				,DM.nombre
				,DM.created_at
				,DM.Activo
		FROM seguridad_perfil DM WHERE DM.id_perfil NOT IN ( SELECT  SP.id_perfil FROM seguridad_perfil SP INNER JOIN seguridad_perfil_users SPU ON SP.id_perfil=SPU.id_perfil	WHERE  SPU.id_usuario = id_usuario_);
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_SEGURIDAD_PERFIL_OBTENER_ELIMINAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_SEGURIDAD_PERFIL_OBTENER_ELIMINAR`;
delimiter ;;
CREATE PROCEDURE `USP_SEGURIDAD_PERFIL_OBTENER_ELIMINAR`(IN id_perfil_users_ 					INT)
BEGIN
		 
		DELETE FROM seguridad_perfil_users WHERE  id_perfil_users = id_perfil_users_;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_SEGURIDAD_PERFIL_OBTENER_LISTA
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_SEGURIDAD_PERFIL_OBTENER_LISTA`;
delimiter ;;
CREATE PROCEDURE `USP_SEGURIDAD_PERFIL_OBTENER_LISTA`(IN id_usuario_ 					INT)
BEGIN
	SELECT
	ROW_NUMBER() OVER (ORDER BY SP.id_perfil ) AS RowIndex
		, SP.id_perfil
		, SPU.id_perfil_users
		, SP.nombre
		, SP.created_at
		, SP.updated_at
		, SPU.id_usuario
		, SP.Activo

		FROM
		seguridad_perfil SP 
		INNER JOIN seguridad_perfil_users SPU ON SP.id_perfil=SPU.id_perfil	
		WHERE  SPU.id_usuario = id_usuario_; 
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_SEGURIDAD_ROLES_ASIGNAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_SEGURIDAD_ROLES_ASIGNAR`;
delimiter ;;
CREATE PROCEDURE `USP_SEGURIDAD_ROLES_ASIGNAR`(IN id_perfil_ 					INT,
IN cadena_id_roles 		TEXT)
BEGIN
-- Referencia: getUpdateWUfromVRFILE
 DECLARE count INT Default 0 ;
 DECLARE valor1_ VARCHAR(255);
 
			
 read_loop: LOOP
         SET count	 = count+1;
         SET valor1_ = SPLIT_STR(cadena_id_roles,"|",count);
				 
         IF valor1_ ='' THEN
            LEAVE read_loop;
         END IF;

				 INSERT INTO `seguridad_roles_perfil` (`id_perfil`, `id_roles`, `created_at`) VALUES (id_perfil_,valor1_,NOW());
			 
 END LOOP read_loop;
 
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_SEGURIDAD_ROLES_ASIGNAR_PERMISOS
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_SEGURIDAD_ROLES_ASIGNAR_PERMISOS`;
delimiter ;;
CREATE PROCEDURE `USP_SEGURIDAD_ROLES_ASIGNAR_PERMISOS`(IN id_roles_ INT,
IN cadena_id_menu	LONGTEXT)
BEGIN
-- En produccion si funciona nirmal
-- SET GLOBAL sql_mode = 'NO_ENGINE_SUBSTITUTION';


-- Referencia: getUpdateWUfromVRFILE
 DECLARE count INT Default 0 ;
 DECLARE valor1_ VARCHAR(255);
 --  LAS SESSIONES SIEMPRE DEBEN IR DEBAJO DE LPS DECLATES O SET
 SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION';
 
 DELETE FROM seguridad_roles_menu WHERE id_roles=id_roles_;
 
 read_loop: LOOP
         SET count	 = count+1;
         SET valor1_ = SPLIT_STR(cadena_id_menu,"|",count);
				 
         IF valor1_ ='' THEN
            LEAVE read_loop;
         END IF;

				 INSERT INTO `seguridad_roles_menu`(`id_roles`, `id_menu`) VALUES (id_roles_,valor1_);
			 
 END LOOP read_loop;
 
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_SEGURIDAD_ROLES_ELIMINAR_MULTIPLE
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_SEGURIDAD_ROLES_ELIMINAR_MULTIPLE`;
delimiter ;;
CREATE PROCEDURE `USP_SEGURIDAD_ROLES_ELIMINAR_MULTIPLE`(IN cadena_id_roles_perfil 		TEXT)
BEGIN
-- Referencia: getUpdateWUfromVRFILE
 DECLARE count INT Default 0 ;
 DECLARE valor1_ VARCHAR(255);
 
			
 read_loop: LOOP
         SET count	 = count+1;
         SET valor1_ = SPLIT_STR(cadena_id_roles_perfil,"|",count);
				 
         IF valor1_ ='' THEN
            LEAVE read_loop;
         END IF;

				 DELETE FROM `seguridad_roles_perfil` WHERE id_roles_perfil = valor1_;
			 
 END LOOP read_loop;
 
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_SEGURIDAD_ROLES_OBTENER_CHECK
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_SEGURIDAD_ROLES_OBTENER_CHECK`;
delimiter ;;
CREATE PROCEDURE `USP_SEGURIDAD_ROLES_OBTENER_CHECK`(IN id_perfil_ 					INT)
BEGIN
		 
		SELECT 
				ROW_NUMBER() OVER (ORDER BY DM.id_roles) AS RowIndex
				,DM.id_roles
				,DM.nombre
				,DM.created_at
				,DM.Activo
		FROM seguridad_roles DM WHERE DM.id_roles NOT IN ( SELECT  SP.id_roles FROM seguridad_roles_perfil	SP WHERE  SP.id_perfil = id_perfil_);
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_SEGURIDAD_ROLES_OBTENER_ELIMINAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_SEGURIDAD_ROLES_OBTENER_ELIMINAR`;
delimiter ;;
CREATE PROCEDURE `USP_SEGURIDAD_ROLES_OBTENER_ELIMINAR`(IN id_roles_perfil_ 					INT)
BEGIN
		 
		DELETE FROM seguridad_roles_perfil WHERE  id_roles_perfil = id_roles_perfil_;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_SEGURIDAD_ROLES_OBTENER_LISTA
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_SEGURIDAD_ROLES_OBTENER_LISTA`;
delimiter ;;
CREATE PROCEDURE `USP_SEGURIDAD_ROLES_OBTENER_LISTA`(IN id_perfil_ 					INT)
BEGIN
	SELECT
			ROW_NUMBER() OVER (ORDER BY SP.id_roles ) AS RowIndex
		, SP.id_roles
		, SPU.id_roles_perfil
		, SP.nombre
		, SP.created_at
		, SP.Activo

		FROM
		seguridad_roles SP 
		INNER JOIN seguridad_roles_perfil SPU ON SP.id_roles=SPU.id_roles	
		WHERE  SPU.id_perfil = id_perfil_; 
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_BANNERS_POPULARES_GESTION
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_BANNERS_POPULARES_GESTION`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_BANNERS_POPULARES_GESTION`(IN p_accion VARCHAR(10),
    IN p_id_banner INT,
    IN p_titulo_principal VARCHAR(100),
    IN p_titulo_secundario VARCHAR(100),
		
    IN p_texto_descuento VARCHAR(50),
    IN p_precio_desde DECIMAL(10,2),
    IN p_url_imagen VARCHAR(255),
    IN p_orden INT,
    IN p_activo CHAR(1),
		IN p_estilo_css VARCHAR(255),
		IN p_url_direccion LONGTEXT)
BEGIN
    IF p_accion = 'INSERTAR' THEN
        INSERT INTO web_populares_banners (titulo_principal, titulo_secundario, texto_descuento, precio_desde, url_imagen, orden, activo,estilo_css, created_at,url_direccion)
        VALUES (p_titulo_principal, p_titulo_secundario, p_texto_descuento, p_precio_desde, p_url_imagen, p_orden, p_activo,p_estilo_css, NOW(),p_url_direccion);
        
        SELECT LAST_INSERT_ID() AS id_banner_popular;
    ELSEIF p_accion = 'ACTUALIZAR' THEN
        UPDATE web_populares_banners 
        SET titulo_principal = p_titulo_principal,
            titulo_secundario = p_titulo_secundario,
            texto_descuento = p_texto_descuento,
            precio_desde = p_precio_desde,
            url_imagen = p_url_imagen,
            orden = p_orden,
            activo = p_activo,
						 estilo_css = p_estilo_css,
            updated_at = NOW(),
						url_direccion = p_url_direccion
        WHERE id_banner_popular = p_id_banner;
        
        SELECT p_id_banner AS id_banner_popular;
    ELSEIF p_accion = 'ELIMINAR' THEN
        DELETE FROM web_populares_banners WHERE id_banner_popular = p_id_banner;
        
        SELECT p_id_banner AS id_banner_popular;
    ELSEIF p_accion = 'LISTAR' THEN
        SELECT * FROM web_populares_banners ORDER BY orden ASC;
    ELSEIF p_accion = 'OBTENER' THEN
        SELECT * FROM web_populares_banners WHERE id_banner_popular = p_id_banner;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_CATEGORIAS_POPULARES_GESTION
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_CATEGORIAS_POPULARES_GESTION`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_CATEGORIAS_POPULARES_GESTION`(IN p_accion VARCHAR(10),
    IN p_id_categoria INT,
    IN p_nombre_categoria VARCHAR(100),
    IN p_url_imagen VARCHAR(255),
    IN p_orden INT,
    IN p_activo CHAR(1),
		IN p_url_direccion LONGTEXT)
BEGIN
    IF p_accion = 'INSERTAR' THEN
        INSERT INTO web_populares_catgorias (nombre_categoria, url_imagen, orden, activo, created_at,url_direccion)
        VALUES (p_nombre_categoria, p_url_imagen, p_orden, p_activo, NOW(),p_url_direccion);
        
        SELECT LAST_INSERT_ID() AS id_categoria_popular;
    ELSEIF p_accion = 'ACTUALIZAR' THEN
        UPDATE web_populares_catgorias 
        SET nombre_categoria = p_nombre_categoria,
            url_imagen = p_url_imagen,
            orden = p_orden,
            activo = p_activo,
            updated_at = NOW(),
						url_direccion = p_url_direccion
        WHERE id_categoria_popular = p_id_categoria;
        
        SELECT p_id_categoria AS id_categoria_popular;
    ELSEIF p_accion = 'ELIMINAR' THEN
        DELETE FROM web_populares_catgorias WHERE id_categoria_popular = p_id_categoria;
        
        SELECT p_id_categoria AS id_categoria_popular;
    ELSEIF p_accion = 'LISTAR' THEN
        SELECT * FROM web_populares_catgorias ORDER BY orden ASC;
    ELSEIF p_accion = 'OBTENER' THEN
        SELECT * FROM web_populares_catgorias WHERE id_categoria_popular = p_id_categoria;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OFERTAS_CALCULAR_COSTO_TOTAL
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OFERTAS_CALCULAR_COSTO_TOTAL`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OFERTAS_CALCULAR_COSTO_TOTAL`(IN p_productos JSON,
    IN p_distrito VARCHAR(100),
    OUT p_subtotal DECIMAL(10,2),
    OUT p_costo_envio DECIMAL(10,2),
    OUT p_total DECIMAL(10,2),
    OUT p_envio_gratis BOOLEAN,
    OUT p_bono_oferta BOOLEAN)
BEGIN
    DECLARE v_peso_total DECIMAL(10,3) DEFAULT 0;
    DECLARE v_subtotal_calculado DECIMAL(10,2) DEFAULT 0;
    DECLARE v_monto_minimo_envio_gratis DECIMAL(10,2);
    DECLARE v_costo_base DECIMAL(10,2);
    DECLARE v_costo_por_kg DECIMAL(10,2);
    
    -- Calcular peso total y subtotal
    SELECT 
        SUM(JSON_EXTRACT(producto, '$.peso')),
        SUM((SELECT precio FROM oferta_precios_peso 
             WHERE activo = 1 AND 
                   JSON_EXTRACT(producto, '$.peso') BETWEEN rango_min AND rango_max) * JSON_EXTRACT(producto, '$.peso'))
    INTO v_peso_total, v_subtotal_calculado
    FROM JSON_TABLE(p_productos, '$[*]' COLUMNS(
        producto JSON PATH '$'
    )) AS products;
    
    -- Obtener costos de envío
    SELECT costo_base, costo_por_kg, monto_minimo_envio_gratis
    INTO v_costo_base, v_costo_por_kg, v_monto_minimo_envio_gratis
    FROM oferta_costo_envios
    WHERE distrito = p_distrito AND activo = 1
    LIMIT 1;
    
    -- Calcular costo de envío
    IF v_subtotal_calculado >= v_monto_minimo_envio_gratis THEN
        SET p_costo_envio = 0;
        SET p_envio_gratis = TRUE;
        SET p_bono_oferta = TRUE;
    ELSE
        SET p_costo_envio = v_costo_base + (v_peso_total * v_costo_por_kg);
        SET p_envio_gratis = FALSE;
        SET p_bono_oferta = FALSE;
    END IF;
    
    SET p_subtotal = v_subtotal_calculado;
    SET p_total = p_subtotal + p_costo_envio;
		/*
		
		CREATE PROCEDURE `USP_WEB_OFERTAS_CALCULAR_COSTO_TOTAL`(IN p_productos JSON,
    IN p_distrito VARCHAR(100),
    OUT p_subtotal DECIMAL(10,2),
    OUT p_costo_envio DECIMAL(10,2),
    OUT p_total DECIMAL(10,2),
    OUT p_envio_gratis BOOLEAN,
    OUT p_bono_oferta BOOLEAN)
BEGIN
    DECLARE v_peso_total DECIMAL(10,3) DEFAULT 0;
    DECLARE v_subtotal_calculado DECIMAL(10,2) DEFAULT 0;
    DECLARE v_monto_minimo_envio_gratis DECIMAL(10,2);
    DECLARE v_costo_base DECIMAL(10,2);
    DECLARE v_costo_por_kg DECIMAL(10,2);
    
    -- Calcular peso total y subtotal
    SELECT 
        SUM(producto->>'$.peso'),
        SUM((SELECT precio FROM oferta_precios_peso 
             WHERE activo = 1 AND 
                   producto->>'$.peso' BETWEEN rango_min AND rango_max) * producto->>'$.peso')
    INTO v_peso_total, v_subtotal_calculado
    FROM JSON_TABLE(p_productos, '$[*]' COLUMNS(
        peso DECIMAL(10,3) PATH '$.peso'
    )) AS producto;
    
    -- Obtener costos de envío
    SELECT costo_base, costo_por_kg, monto_minimo_envio_gratis
    INTO v_costo_base, v_costo_por_kg, v_monto_minimo_envio_gratis
    FROM oferta_costo_envios
    WHERE distrito = p_distrito AND activo = 1
    LIMIT 1;
    
    -- Calcular costo de envío
    IF v_subtotal_calculado >= v_monto_minimo_envio_gratis THEN
        SET p_costo_envio = 0;
        SET p_envio_gratis = TRUE;
        SET p_bono_oferta = TRUE;
    ELSE
        SET p_costo_envio = v_costo_base + (v_peso_total * v_costo_por_kg);
        SET p_envio_gratis = FALSE;
        SET p_bono_oferta = FALSE;
    END IF;
    
    SET p_subtotal = v_subtotal_calculado;
    SET p_total = p_subtotal + p_costo_envio;
END

		*/
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OFERTAS_DEL_DIA
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OFERTAS_DEL_DIA`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OFERTAS_DEL_DIA`(IN p_action VARCHAR(10),
    IN p_id_oferta_dia INT,
    IN p_id_producto INT,
    IN p_nombre_oferta VARCHAR(255),
    IN p_precio_oferta VARCHAR(255),
		
    IN p_precio_original VARCHAR(255),
    IN p_start_time DATETIME,
    IN p_end_time DATETIME,
    IN p_cantidad_disponible INT,
    IN p_Activo CHAR(1),
		
		IN p_id_membresia INT,
		IN p_segundo_id_producto INT,
		IN p_segundo_nombre_oferta VARCHAR(255),
		IN p_segundo_precio_oferta VARCHAR(255))
BEGIN
    IF p_action = 'INSERT' THEN
        -- Aseguramos que solo haya una oferta activa
        -- DELETE FROM oferta_del_dia WHERE Activo = 'S';
				UPDATE oferta_del_dia set Activo='N';
        
        INSERT INTO oferta_del_dia (
            id_producto, 
            nombre_oferta, 
            precio_oferta, 
            precio_original, 
            start_time, 
            end_time, 
            cantidad_disponible, 
            cantidad_vendida,
            Activo,
						id_membresia,
            created_at,
            updated_at,
						
						segundo_id_producto,
						segundo_nombre_oferta,
						segundo_precio_oferta
						
        ) VALUES (
            p_id_producto,
            p_nombre_oferta,
            p_precio_oferta,
            p_precio_original,
            p_start_time,
            p_end_time,
            p_cantidad_disponible,
            0, -- cantidad_vendida inicia en 0
            p_Activo,
						p_id_membresia,
            NOW(),
            NOW(),
						
						p_segundo_id_producto,
						p_segundo_nombre_oferta,
						p_segundo_precio_oferta
						
        );
    ELSEIF p_action = 'UPDATE' THEN
        UPDATE oferta_del_dia 
        SET 
            id_producto = p_id_producto,
            nombre_oferta = p_nombre_oferta,
            precio_oferta = p_precio_oferta,
            precio_original = p_precio_original,
            start_time = p_start_time,
            end_time = p_end_time,
            cantidad_disponible = p_cantidad_disponible,
            Activo = p_Activo,
						id_membresia=p_id_membresia,
            updated_at = NOW(),
						
						segundo_id_producto = p_segundo_id_producto,
						segundo_nombre_oferta = p_segundo_nombre_oferta,
						segundo_precio_oferta = p_segundo_precio_oferta
						
        WHERE id_oferta_dia = p_id_oferta_dia;
    ELSEIF p_action = 'DELETE' THEN
        DELETE FROM oferta_del_dia WHERE id_oferta_dia = p_id_oferta_dia;
    ELSEIF p_action = 'DEACTIVATE' THEN
        UPDATE oferta_del_dia SET Activo = 'N' WHERE id_oferta_dia = p_id_oferta_dia;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OFERTAS_DEL_DIA_OBTENER
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OFERTAS_DEL_DIA_OBTENER`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OFERTAS_DEL_DIA_OBTENER`(IN p_id_oferta_dia INT)
BEGIN
    -- Validar parámetro de entrada
    IF p_id_oferta_dia IS NULL OR p_id_oferta_dia <= 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El ID de oferta del día debe ser un valor positivo';
    END IF;
    
    -- Consulta optimizada con JOIN en lugar de subconsultas
    SELECT
        ROW_NUMBER() OVER (ORDER BY AE.id_oferta_dia) AS RowIndex,
        AE.id_oferta_dia,
        AE.id_producto,
        AE.nombre_oferta,
        AE.precio_oferta,
        AE.precio_original,
        AE.start_time,
        AE.end_time,
        AE.cantidad_disponible,
        AE.cantidad_vendida,
        AE.Activo,
        AE.id_membresia,
        AE.segundo_id_producto,
        AE.segundo_nombre_oferta,
        AE.segundo_precio_oferta,
        AP.precio AS segundo_precio_original,
        AP.stock AS segundo_cantidad_disponible
    FROM oferta_del_dia AE
    LEFT JOIN administracion_producto AP ON AE.segundo_id_producto = AP.id_producto
    WHERE AE.id_oferta_dia = p_id_oferta_dia;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OFERTAS_GESTION_COSTO_ENVIOS
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OFERTAS_GESTION_COSTO_ENVIOS`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OFERTAS_GESTION_COSTO_ENVIOS`(IN p_accion VARCHAR(10),
    IN p_id INT,
    IN p_distrito VARCHAR(100),
    IN p_costo_base DECIMAL(10,2),
    IN p_costo_por_kg DECIMAL(10,2),
    IN p_monto_minimo_envio_gratis DECIMAL(10,2),
    IN p_activo TINYINT)
BEGIN
    IF p_accion = 'INSERT' THEN
        INSERT INTO oferta_costo_envios (distrito, costo_base, costo_por_kg, monto_minimo_envio_gratis, activo)
        VALUES (p_distrito, p_costo_base, p_costo_por_kg, p_monto_minimo_envio_gratis, p_activo);
    ELSEIF p_accion = 'UPDATE' THEN
        UPDATE oferta_costo_envios 
        SET distrito = p_distrito,
            costo_base = p_costo_base,
            costo_por_kg = p_costo_por_kg,
            monto_minimo_envio_gratis = p_monto_minimo_envio_gratis,
            activo = p_activo
        WHERE id = p_id;
    ELSEIF p_accion = 'DELETE' THEN
        DELETE FROM oferta_costo_envios WHERE id = p_id;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OFERTAS_GESTION_PRECIOS_OBTENER
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OFERTAS_GESTION_PRECIOS_OBTENER`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OFERTAS_GESTION_PRECIOS_OBTENER`(IN p_paqueta_medidas VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_paquete_dimencion VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_peso_kilogramo VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci)
BEGIN
    -- Consulta con filtros exactos. p_peso_kilogramo en gramos, CAST a DECIMAL para comparación precisa
    SELECT
        ROW_NUMBER() OVER (ORDER BY AE.id_precio_peso) AS RowIndex,
        AE.id_precio_peso,
        AE.rango_min,
        AE.rango_max,
        AE.precio,
        AE.paqueta_medidas,
        AE.paquete_dimencion,
        AE.pago_contra_entrega,
        AE.hora_regresiva,
        AE.hora_regresiva_descripcion,
        AE.address_departamento,
        AE.address_distrito,
        AE.Activo,
        AE.created_at,
        AE.updated_at,
        AE.deleted_at
    FROM oferta_precios_peso AE
    WHERE AE.paqueta_medidas COLLATE utf8mb4_unicode_ci = p_paqueta_medidas
      AND AE.paquete_dimencion COLLATE utf8mb4_unicode_ci = p_paquete_dimencion
      AND AE.rango_min IS NOT NULL
      AND AE.rango_max IS NOT NULL
      AND p_peso_kilogramo IS NOT NULL
      AND p_peso_kilogramo != ''
      AND CAST(p_peso_kilogramo AS DECIMAL(10,3)) BETWEEN AE.rango_min AND AE.rango_max;  -- Solo CAST, sin /1000
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OFERTAS_GESTION_PRECIOS_PESO
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OFERTAS_GESTION_PRECIOS_PESO`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OFERTAS_GESTION_PRECIOS_PESO`(IN p_accion VARCHAR(10),
    IN p_id INT,
    IN p_rango_min DECIMAL(10,3),
    IN p_rango_max DECIMAL(10,3),
    IN p_precio DECIMAL(10,2),
    IN p_activo VARCHAR(11), -- 6
    -- Nuevos campos agregados
    IN p_pago_contra_entrega  VARCHAR(11),
    IN p_hora_regresiva VARCHAR(255),
		
    IN p_hora_regresiva_descripcion VARCHAR(255),
    IN p_paqueta_medidas VARCHAR(255),
    IN p_paquete_dimencion VARCHAR(255),
    IN p_address_id_departamento VARCHAR(255),
    IN p_address_id_provincia VARCHAR(255),
		
    IN p_address_ubigueo VARCHAR(255),
    IN p_address_departamento VARCHAR(255),
    IN p_address_provincia VARCHAR(255),
    IN p_address_distrito VARCHAR(255),
    IN p_address_direccion VARCHAR(255))
BEGIN
    IF p_accion = 'INSERT' THEN
        INSERT INTO oferta_precios_peso (
            rango_min,
            rango_max,
            precio,
            Activo,
            pago_contra_entrega,
            hora_regresiva,
            hora_regresiva_descripcion,
            paqueta_medidas,
            paquete_dimencion,
            address_id_departamento,
            address_id_provincia,
            address_ubigueo,
            address_departamento,
            address_provincia,
            address_distrito,
            address_direccion
        )
        VALUES (
            p_rango_min,
            p_rango_max,
            p_precio,
            p_activo,
            p_pago_contra_entrega,
            p_hora_regresiva,
            p_hora_regresiva_descripcion,
            p_paqueta_medidas,
            p_paquete_dimencion,
            p_address_id_departamento,
            p_address_id_provincia,
            p_address_ubigueo,
            p_address_departamento,
            p_address_provincia,
            p_address_distrito,
            p_address_direccion
        );
    ELSEIF p_accion = 'UPDATE' THEN
        UPDATE oferta_precios_peso
        SET
            rango_min = p_rango_min,
            rango_max = p_rango_max,
            precio = p_precio,
            Activo = p_activo,
            -- Nuevos campos para actualizar
            pago_contra_entrega = p_pago_contra_entrega,
            hora_regresiva = p_hora_regresiva,
            hora_regresiva_descripcion = p_hora_regresiva_descripcion,
            paqueta_medidas = p_paqueta_medidas,
            paquete_dimencion = p_paquete_dimencion,
            address_id_departamento = p_address_id_departamento,
            address_id_provincia = p_address_id_provincia,
            address_ubigueo = p_address_ubigueo,
            address_departamento = p_address_departamento,
            address_provincia = p_address_provincia,
            address_distrito = p_address_distrito,
            address_direccion = p_address_direccion
        WHERE id_precio_peso = p_id;
    ELSEIF p_accion = 'DELETE' THEN
        UPDATE oferta_precios_peso SET  deleted_at = NOW() WHERE id_precio_peso = p_id;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OFERTAS_GESTION_PRECIOS_PESO_LISTAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OFERTAS_GESTION_PRECIOS_PESO_LISTAR`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OFERTAS_GESTION_PRECIOS_PESO_LISTAR`()
BEGIN

        SELECT 
            opp.*,
            COALESCE(ap.id_producto, 'Sin productos') as id_producto,
            COALESCE(ap.nombre, 'Ninguno') as nombre_producto,
            COALESCE(ap.peso_kilogramo, 0) as peso_actual
        FROM 
            oferta_precios_peso opp
        LEFT JOIN 
            administracion_producto ap 
            ON ap.peso_kilogramo COLLATE utf8mb4_general_ci >= opp.rango_min COLLATE utf8mb4_general_ci
            AND ap.peso_kilogramo COLLATE utf8mb4_general_ci <= opp.rango_max COLLATE utf8mb4_general_ci
        ORDER BY 
            opp.rango_min COLLATE utf8mb4_general_ci, 
            ap.peso_kilogramo COLLATE utf8mb4_general_ci;

END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OPE_ENVIO_CALCULAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OPE_ENVIO_CALCULAR`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OPE_ENVIO_CALCULAR`(IN p_address_departamento VARCHAR(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_address_distrito VARCHAR(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_rango_min_max DECIMAL(10,3),
    IN p_paquete_medidas VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_paquete_dimension VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_id_producto VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci)
BEGIN
    DECLARE v_precio DECIMAL(10,2) DEFAULT NULL;
    DECLARE v_distrito VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;
    DECLARE v_rango_min DECIMAL(10,3) DEFAULT NULL;
    DECLARE v_rango_max DECIMAL(10,3) DEFAULT NULL;
    DECLARE v_paquete_medidas VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;
    DECLARE v_pago_contra_entrega VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;
    DECLARE v_hora_regresiva VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;
    DECLARE v_hora_regresiva_descripcion VARCHAR(900) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;
    DECLARE v_encontrado INT DEFAULT 0;
    DECLARE v_paquete_dimension_num INT DEFAULT NULL;
    
    -- Mapear el texto de dimensión a número
    SET v_paquete_dimension_num = CASE 
        WHEN UPPER(p_paquete_dimension) = 'PEQUEÑO' THEN 1
        WHEN UPPER(p_paquete_dimension) = 'MEDIANO' THEN 2
        WHEN UPPER(p_paquete_dimension) = 'GRANDE' THEN 3
        WHEN p_paquete_dimension REGEXP '^[0-9]+$' THEN CAST(p_paquete_dimension AS UNSIGNED)
        ELSE NULL
    END;
    
    SELECT
        pp.pago_contra_entrega,
        pp.hora_regresiva,
				 pp.hora_regresiva_descripcion,
				/*
        COALESCE(
            (SELECT corte_tiempo_promocion 
             FROM administracion_producto 
             WHERE id_producto = p_id_producto 
             LIMIT 1), 
            NULL
        ) AS hora_regresiva_descripcion,
				*/
        pp.address_distrito,
        pp.rango_min,
        pp.rango_max,
        pp.precio,
        pp.paquete_medidas,
        1 AS encontrado
    INTO
        v_pago_contra_entrega,
        v_hora_regresiva,
        v_hora_regresiva_descripcion,
        v_distrito,
        v_rango_min,
        v_rango_max,
        v_precio,
        v_paquete_medidas,
        v_encontrado
    FROM 
        oferta_precios_peso pp 
    WHERE 
        pp.address_departamento COLLATE utf8mb4_unicode_ci = p_address_departamento 
        AND pp.address_distrito COLLATE utf8mb4_unicode_ci = p_address_distrito
        -- Filtro por rango de peso
        AND (p_rango_min_max IS NULL OR (p_rango_min_max >= pp.rango_min AND p_rango_min_max <= pp.rango_max))
        -- Filtro por tipo de paquete
        AND (p_paquete_medidas IS NULL OR pp.paquete_medidas COLLATE utf8mb4_unicode_ci = p_paquete_medidas)
        -- Filtro por dimensión (AHORA COMPARA NÚMEROS)
        AND (v_paquete_dimension_num IS NULL OR pp.paquete_dimencion = v_paquete_dimension_num)
    ORDER BY
        CASE WHEN p_rango_min_max IS NOT NULL THEN pp.rango_max - pp.rango_min ELSE 999999 END ASC
    LIMIT 1;
    
    SELECT 
        (SELECT contacto_direccion FROM web_footer WHERE id_footer = 1) AS contacto_direccion,
        CASE 
            WHEN v_encontrado = 0 THEN 'NO_DISPONIBLE'
            WHEN v_pago_contra_entrega = '1' THEN  1 #'Puedes pagar al momento de la entrega' 
            ELSE NULL 
        END AS pago_contra_entrega,
        v_hora_regresiva AS hora_regresiva,
        v_hora_regresiva_descripcion AS hora_regresiva_descripcion,
        v_distrito AS distrito,
        p_address_departamento AS address_departamento,
        v_rango_min AS rango_minimo,
        v_rango_max AS rango_maximo,
        v_precio AS precio_envio,
        v_paquete_medidas AS tipo_paquete,
        CASE 
            WHEN v_encontrado = 0 THEN 'NO_ENCONTRADO'
            WHEN p_rango_min_max IS NOT NULL AND v_rango_min IS NOT NULL 
                 AND p_rango_min_max BETWEEN v_rango_min AND v_rango_max 
            THEN 'OK' 
            WHEN p_rango_min_max IS NOT NULL AND v_rango_min IS NULL
            THEN 'SIN_COBERTURA'
            ELSE 'FUERA_DE_RANGO' 
        END AS estado_rango;
        
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OPE_ENVIO_DEPARTAMENTOS
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OPE_ENVIO_DEPARTAMENTOS`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OPE_ENVIO_DEPARTAMENTOS`()
BEGIN
    SELECT 
        DISTINCT(address_departamento) AS address_departamento
    FROM oferta_precios_peso

    ORDER BY address_departamento;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OPE_ENVIO_DISTRITO
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OPE_ENVIO_DISTRITO`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OPE_ENVIO_DISTRITO`(IN p_address_departamento VARCHAR(255))
BEGIN
    DECLARE v_departamento_count INT;
    
    -- Validar que el parámetro no sea nulo o vacío
    IF p_address_departamento IS NULL OR p_address_departamento = '' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El parámetro p_address_provincia no puede ser nulo o vacío';
    END IF;
    
    -- Verificar si el p_address_departamento existe
    SELECT COUNT(*) INTO v_departamento_count
    FROM oferta_precios_peso
    WHERE address_departamento = p_address_departamento;
    
    IF v_departamento_count = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El provincia especificado no existe';
    END IF;
    
    -- Obtener las provincias
    SELECT 
        DISTINCT(address_distrito) AS address_distrito
    FROM oferta_precios_peso
    WHERE address_departamento = p_address_departamento
    ORDER BY address_distrito;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OPE_PEDIDOS_CREAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OPE_PEDIDOS_CREAR`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OPE_PEDIDOS_CREAR`(IN txt_nombre 						VARCHAR(255),
IN txt_apellido 					VARCHAR(255),
IN txt_email 							VARCHAR(255),
IN txt_direccion 					VARCHAR(255),
IN txt_telefono 					VARCHAR(255),
IN txt_dni 								VARCHAR(255),
IN txt_ruc 								VARCHAR(255),

IN cb_pais 								VARCHAR(255),
IN cb_ciudad 							VARCHAR(255),
IN cb_provincia 					VARCHAR(255),
IN cb_distrito 						VARCHAR(255),

IN codigo_pedido_					  VARCHAR(255),
IN codigo_boleta_o_factura_	VARCHAR(255),
IN id_cliente_					    VARCHAR(255),
								
IN check_terminos_					  TINYINT,
IN check_direccion_envio_		  TINYINT,
IN check_privacidad_cliente_  TINYINT,
IN radio_metodo_pago_				  TINYINT,
IN p_pasarela_costo_envio 							VARCHAR(255),
IN p_hora_regresiva_descripcion 							VARCHAR(255),
IN p_radio_tipo_pago 							VARCHAR(255))
BEGIN
	
		INSERT INTO `ope_pedidos` (
		
		  #`codigo_pedido`
		#, `id_cliente`
		#, `metodo_pago`
		#, `metodo_envio`
		  `direccion_envio_nombre`
		, `direccion_envio_apellido`
		, `direccion_envio_correo`
		, `direccion_envio_ubicacion`
		, `direccion_envio_telefono`
		, `direccion_envio_dni`
		, `direccion_envio_ruc`
		
		, `direccion_envio_pais`
		, `direccion_envio_ciudad`
		, `direccion_envio_provincia`
		, `direccion_envio_distrito`
		
		#, `estado`
		, `created_at`
		, `updated_at`
		, `Activo`
		, codigo_pedido
		, codigo_boleta_o_factura
		, id_cliente

		, check_terminos
		, check_direccion_envio
		, check_privacidad_cliente
		, radio_metodo_pago
		
		, pasarela_costo_envio
		, hora_regresiva_descripcion
		, radio_tipo_pago
		)
		
		 VALUES (
		   txt_nombre
		 , txt_apellido
		 , txt_email
		 , txt_direccion
		 , txt_telefono
		 , txt_dni
		 , txt_ruc
		 
		 , cb_pais
		 , cb_ciudad
		 , cb_provincia
		 , cb_distrito
		 
		 , NOW()
		 , NOW()
		 , 'S'
		 , codigo_pedido_
		 , codigo_boleta_o_factura_
		 , id_cliente_
		 
		 , check_terminos_
		 , check_direccion_envio_
		 , check_privacidad_cliente_
		 , radio_metodo_pago_
		 , p_pasarela_costo_envio
		 , p_hora_regresiva_descripcion
		 , p_radio_tipo_pago
		 );
 
    -- Obtenemos el último ID insertado
    SELECT LAST_INSERT_ID() AS id_pedido;
		
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OPE_PEDIDOS_CREAR_VALIDAR_CODIGO
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OPE_PEDIDOS_CREAR_VALIDAR_CODIGO`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OPE_PEDIDOS_CREAR_VALIDAR_CODIGO`(IN codigo_pedido_ VARCHAR(20))
BEGIN

    DECLARE isValue INT;
		DECLARE codigoUltimo VARCHAR(20);
		DECLARE valido VARCHAR(20);

		-- SET time_zone = 'Europe/Madrid';

    SET isValue = (SELECT count(1) FROM ope_pedidos WHERE  codigo_pedido=codigo_pedido_ COLLATE utf8mb4_general_ci); -- COLLATE added); -- '22-0001'

    IF(isValue > 0) THEN
				-- SELECT  CONCAT(SUBSTRING(YEAR(NOW()),3,4),'-' , LPAD((SUBSTRING('22-0885',4,7)+1), 4, 0))
       SET codigoUltimo = (SELECT codigo_pedido FROM ope_pedidos ORDER by id_pedido DESC LIMIT 1);
			 SET valido = CONCAT(SUBSTRING(YEAR(NOW()),3,4),'-' , LPAD((SUBSTRING(codigoUltimo,4,7)+1), 4, 0));
    ELSE
       SET valido = codigo_pedido_ COLLATE utf8mb4_general_ci;-- COLLATE added;
    END IF;

    SELECT valido;

END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OPE_PEDIDOS_LISTAR_CLIENTE
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OPE_PEDIDOS_LISTAR_CLIENTE`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OPE_PEDIDOS_LISTAR_CLIENTE`(IN page 			 INT, 
IN page_size 	 INT,
IN id_cliente_ INT)
BEGIN
		 
		DECLARE offset_ INT;
	  SET offset_ = (page - 1) * page_size;
				
		SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_pedido) AS RowIndex
					, AE.id_pedido
					, AE.codigo_pedido
					, AE.id_cliente
					, AE.metodo_pago
					, AE.metodo_envio
					, AE.direccion_envio_nombre
					, AE.direccion_envio_apellido
					, AE.direccion_envio_correo
					, AE.direccion_envio_ubicacion
					, AE.direccion_envio_dni
					, AE.direccion_envio_ruc
					, AE.direccion_envio_pais
					, AE.direccion_envio_ciudad
					, AE.direccion_envio_distrito
					, AE.estado
					, AE.created_at
					, AE.updated_at
					, AE.Activo
 
					
			FROM  ope_pedidos AE WHERE AE.id_cliente= id_cliente_

			ORDER BY AE.id_pedido DESC LIMIT page_size OFFSET offset_;
			
 
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OPE_PEDIDOS_PRODUCTO_CREAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OPE_PEDIDOS_PRODUCTO_CREAR`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OPE_PEDIDOS_PRODUCTO_CREAR`(IN id_pedido_ 						VARCHAR(255),
IN codigo_producto_ 			VARCHAR(255),
IN cantidad_ 							VARCHAR(255),
IN id_producto_ 					INT,
IN url_imagen_ 						VARCHAR(255),

IN name_ 						   		VARCHAR(255),
IN price_ 						 		VARCHAR(255),
IN descripcion_ 				  TEXT)
BEGIN
	
	DECLARE is_url_imagen VARCHAR(255);
	
	SET is_url_imagen = REPLACE(url_imagen_, 'storage_', 'storage_cliente');
	
				
	 # 1. =====================INSERTANDO DETALLE DEL PRODUCTO
 INSERT INTO `ope_pedidos_producto`(
		
				 `id_pedido`
				 
			 , `codigo_producto`
			 , `id_producto`
			 , `pro_nombre`
			 , `pro_descripcion`
			 , `pro_precio`
			 
			 , `pro_cantidad`
			 , `pro_url_imagen`
		 
				, `created_at`
				, `updated_at`
				, `Activo`
				)
 VALUES( 
				 id_pedido_
			 , codigo_producto_
			 , id_producto_
			 
			 , name_
			 , descripcion_
			 , price_
			 
			 ,  cantidad_ 
			 ,  is_url_imagen
			 ,  NOW()
			 ,  NOW()
			 ,  'S');

 
 # 2. =====================INSERTANDO LA FICHA TECNICA
 INSERT INTO `ope_pedidos_ficha_tecnica` (
		
				   id_pedido
				, `id_producto`
				, `orden`
				, `titulo`
				, `descripcion` 
		 
				, `created_at`
				, `updated_at`

				)
 SELECT 
		   id_pedido_
		, `id_producto`
		, `orden`
		, `titulo`
		, `descripcion` 
				
		 , NOW()
		 , NOW()

		 
 FROM administracion_producto_ficha_tecnica WHERE id_producto = id_producto_;
 
 

END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OPE_PEDIDO_DETALLE
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OPE_PEDIDO_DETALLE`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OPE_PEDIDO_DETALLE`(IN id_pedido_ 					INT,
IN id_producto_ 		VARCHAR(255))
BEGIN
			 
	  SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_pedido_producto) AS RowIndex
				 , AE.id_pedido_producto
				 , AE.pro_nombre
				 , AE.pro_descripcion
				 , AE.pro_precio
				 , AE.pro_cantidad
				 , AE.pro_url_imagen
				 , AE.created_at

		FROM  ope_pedidos_producto AE	WHERE AE.id_producto=id_producto_ AND AE.id_pedido=id_pedido_
		ORDER BY AE.id_producto DESC;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OPE_PEDIDO_FICHA_TECNICA
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OPE_PEDIDO_FICHA_TECNICA`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OPE_PEDIDO_FICHA_TECNICA`(IN id_pedido_ 			INT,
IN id_producto_ 		INT)
BEGIN

	  SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_producto) AS RowIndex
					,AE.id_producto
				 , AE.titulo
				 , AE.descripcion
				 , AE.orden
					
		FROM  ope_pedidos_ficha_tecnica AE 
		WHERE AE.id_producto=id_producto_ AND AE.id_pedido=id_pedido_
		ORDER BY AE.orden ASC;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_OPE_PEDIDO_LISTAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_OPE_PEDIDO_LISTAR`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_OPE_PEDIDO_LISTAR`(IN page 			INT, 
IN page_size 	INT,
IN id_usuario_ INT)
BEGIN

		DECLARE id_cliente_ INT;
		DECLARE cantidad_ 	INT;
		DECLARE offset_ 		INT;
		
	  SET offset_ = (page - 1) * page_size;
		
		SELECT 
			AC.id_cliente INTO id_cliente_ 
		FROM users U INNER JOIN administracion_cliente AC  ON  U.id=AC.id_usuario
		WHERE AC.id_usuario=id_usuario_;
		
		SELECT 
			COUNT(DISTINCT(OPP.id_pedido)) INTO cantidad_
		FROM  ope_pedidos OP INNER JOIN ope_pedidos_producto OPP ON OP.id_pedido=OPP.id_pedido
		WHERE OP.id_cliente=id_cliente_;
			
		#OBTENEMOS EL TOTAL DE LA PAGINA EN GRUPOS PARA EL PAGINADO

		/*
		WITH obtener_cliente AS (
		SELECT AC.id_cliente FROM users U INNER JOIN administracion_cliente AC  ON  U.id=AC.id_usuario
		WHERE AC.id_usuario=1
		)	 
		*/		 
						SELECT
									 ROW_NUMBER() OVER (ORDER BY OPP.id_pedido_producto) AS RowIndex
									,OPP.id_pedido_producto
									,OPP.pro_nombre
									,OPP.pro_cantidad
									,OPP.pro_precio
									,OPP.pro_url_imagen
									
									,OPP.id_pedido
								  ,OPP.codigo_producto
									,OP.codigo_pedido
									,OPP.id_producto
									,cantidad_ as cantidad
									,OP.created_at
									,OP.subido_comprobante_url
									,OP.comprobante_conforme
									
									,OP.direccion_envio_ubicacion
									,OP.pasarela_estado_pago
									,OP.estado as estado_en_camino
									
						FROM  ope_pedidos OP INNER JOIN ope_pedidos_producto OPP ON OP.id_pedido=OPP.id_pedido
						WHERE OP.id_cliente=id_cliente_
						ORDER BY OPP.id_pedido_producto DESC LIMIT page_size OFFSET offset_;
					
					 
	END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_PRODUCTO_LISTAR
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_PRODUCTO_LISTAR`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_PRODUCTO_LISTAR`()
BEGIN
		 			/*
		WITH listaImagenes AS (
			SELECT * FROM administracion_producto_imagen -- WHERE imagen_principal=1
		)
		*/
	  SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_producto) AS RowIndex
					,AE.id_producto
				 , AE.nombre AS titulo
				 , AE.descripcion
				 , AE.precio
				  , AE.precio_old
				 , AE.stock
				 , AE.corte_tiempo_promocion
				 , AE.precio_yape
					
				 , AE.created_at
				 , AE.Activo
				 , AE.url_imagen
				 , WF.id_usuario
				 , WF.id_favorito
				 , AE.id_producto_tipo
				 ,CASE WHEN AE.numero_estrellas IS NULL OR AE.numero_estrellas ='null' THEN 0 ELSE AE.numero_estrellas END AS  numero_estrellas
				 -- , API.estado_mas_vendido
 
					
		FROM  administracion_producto AE 
		-- LEFT JOIN administracion_producto_imagen API ON AE.id_producto=API.id_producto
		LEFT JOIN web_favoritos	 WF ON AE.id_producto=WF.id_producto
		WHERE  AE.id_producto_tipo = 2 -- 1. Indica Nuestros productos
		AND AE.Activo='S'
		ORDER BY AE.id_producto ASC LIMIT 12;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_PRODUCTO_LISTAR_DESEOS
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_PRODUCTO_LISTAR_DESEOS`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_PRODUCTO_LISTAR_DESEOS`(IN id_usuario_ INT)
BEGIN
    -- Por ahora que sea todos los productos principales
		 	/*		
		WITH listaImagenes AS (
		SELECT * FROM administracion_producto_imagen -- WHERE imagen_principal=1
		)
		*/
	  SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_producto) AS RowIndex
					,AE.id_producto
				 , AE.nombre AS titulo
				 , AE.descripcion
				 , AE.precio
				 , AE.stock

				 , AE.created_at
				 , AE.Activo
				 , APC.nombre AS nombre_categoria
				 , AE.url_imagen
				 , WF.id_usuario
				 , WF.id_favorito
 
					
		FROM  administracion_producto AE 
		INNER JOIN administracion_producto_categoria APC ON AE.id_producto_categoria=APC.id_producto_categoria
		-- LEFT JOIN listaImagenes API ON AE.id_producto=API.id_producto
		LEFT JOIN web_favoritos	 WF ON AE.id_producto=WF.id_producto
		WHERE WF.id_usuario= id_usuario_
		ORDER BY AE.id_producto ;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_PRODUCTO_LISTAR_GALERIA
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_PRODUCTO_LISTAR_GALERIA`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_PRODUCTO_LISTAR_GALERIA`(IN page INT, 
    IN page_size INT,
    IN id_usuario_ INT,
    IN id_producto_categoria_ VARCHAR(255),
    IN id_producto_categoria_sub_ VARCHAR(255),
    IN solo_categorias_ VARCHAR(255),
    IN orden_ VARCHAR(50),
    IN busqueda_ VARCHAR(255))
BEGIN
    DECLARE offset_ INT;
    SET offset_ = (page - 1) * page_size;
    
    -- Construcción de la consulta SQL
    SET @sql = 'SELECT 
		P.id_producto
		, P.nombre AS titulo
		, P.descripcion
		, P.precio
		, P.precio_old
		, P.numero_estrellas
		, P.stock
		, P.corte_tiempo_promocion
		, P.precio_yape
		, P.created_at
		, P.Activo
		, PC.nombre AS nombre_categoria
		, P.url_imagen, ';
    
    -- Campos adicionales según si hay usuario
    IF id_usuario_ = 0 THEN
        SET @sql = CONCAT(@sql, '0 AS id_usuario, 0 AS es_favorito ');
    ELSE
        SET @sql = CONCAT(@sql, id_usuario_, ' AS id_usuario, 
            IFNULL((SELECT id_usuario FROM web_favoritos 
                   WHERE id_producto = P.id_producto AND id_usuario = ', id_usuario_, '), 0) AS es_favorito ');
    END IF;
    
    -- Continuación de la consulta
    SET @sql = CONCAT(@sql, 'FROM administracion_producto P
        INNER JOIN administracion_producto_categoria PC ON P.id_producto_categoria = PC.id_producto_categoria
        WHERE P.Activo = ''S''');  -- Solo productos activos
    
    -- Filtros condicionales
    IF (id_producto_categoria_ IS NOT NULL AND id_producto_categoria_ != '') THEN
        -- FILTRO PRINCIPAL: Cuando se especifica una categoría
        SET @sql = CONCAT(@sql, ' AND P.id_producto_categoria IN (', id_producto_categoria_, ')');
        
        -- Si también se especifica una subcategoría, filtrar por ambas
        IF (id_producto_categoria_sub_ IS NOT NULL AND id_producto_categoria_sub_ != '') THEN
            SET @sql = CONCAT(@sql, ' AND P.id_producto_categoria_sub IN (', id_producto_categoria_sub_, ')');
        ELSE
            -- Si NO se especifica subcategoría, mostrar productos SIN subcategoría de esa categoría
            SET @sql = CONCAT(@sql, ' AND P.id_producto_categoria_sub IS NULL');
        END IF;
        
    ELSEIF (solo_categorias_ IS NOT NULL AND solo_categorias_ != '') THEN
        -- FILTRO ALTERNATIVO: Solo categorías sin subcategorías (parámetro legacy)
        SET @sql = CONCAT(@sql, ' AND P.id_producto_categoria IN (', solo_categorias_, ') 
                                  AND P.id_producto_categoria_sub IS NULL');
    END IF;
    
    -- Búsqueda por texto
    IF busqueda_ IS NOT NULL AND busqueda_ != '' THEN
        SET @sql = CONCAT(@sql, ' AND (P.nombre LIKE ''%', busqueda_, '%'' 
                          OR P.descripcion LIKE ''%', busqueda_, '%''
                          OR P.codigo_producto LIKE ''%', busqueda_, '%'')');
    END IF;
    
    -- Ordenamiento
    SET @sql = CONCAT(@sql, ' ORDER BY ');
    CASE orden_
        WHEN 'precio_asc' THEN SET @sql = CONCAT(@sql, 'P.precio ASC');
        WHEN 'precio_desc' THEN SET @sql = CONCAT(@sql, 'P.precio DESC');
        WHEN 'mas_vendidos' THEN SET @sql = CONCAT(@sql, 'P.ventas DESC');
        WHEN 'mas_favoritos' THEN SET @sql = CONCAT(@sql, '(SELECT COUNT(*) FROM web_favoritos WF WHERE WF.id_producto = P.id_producto) DESC');
        WHEN 'relevancia' THEN 
            -- Ordenar por relevancia de búsqueda si hay texto de búsqueda
            IF busqueda_ IS NOT NULL AND busqueda_ != '' THEN
                SET @sql = CONCAT(@sql, 
                    'CASE 
                        WHEN P.nombre LIKE ''%', busqueda_, '%'' THEN 1
                        WHEN P.descripcion LIKE ''%', busqueda_, '%'' THEN 2
                        WHEN P.codigo_producto LIKE ''%', busqueda_, '%'' THEN 3
                        ELSE 4
                    END, P.id_producto DESC');
            ELSE
                SET @sql = CONCAT(@sql, 'P.id_producto DESC');
            END IF;
        ELSE SET @sql = CONCAT(@sql, 'P.id_producto DESC');
    END CASE;
    
    -- Paginación
    SET @sql = CONCAT(@sql, ' LIMIT ', page_size, ' OFFSET ', offset_);
    
    -- Ejecutar consulta
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_PRODUCTO_LISTAR_GALERIA_CATEGORIA
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_PRODUCTO_LISTAR_GALERIA_CATEGORIA`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_PRODUCTO_LISTAR_GALERIA_CATEGORIA`(IN p_busqueda VARCHAR(255))
BEGIN
    -- Primero obtenemos TODAS las categorías que NO tienen subcategorías
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_categorias_sin_sub AS
    SELECT 
        CA.id_producto_categoria,
        TRIM(CA.nombre) AS nombre_categoria,
        NULL AS id_producto_categoria_sub,
        NULL AS nombre_categoria_sub,
        COUNT(P.id_producto) AS total_productos
    FROM administracion_producto_categoria CA
    LEFT JOIN administracion_producto_categoria_sub SUB ON CA.id_producto_categoria = SUB.id_producto_categoria
    LEFT JOIN administracion_producto P ON CA.id_producto_categoria = P.id_producto_categoria 
                                     AND P.id_producto_categoria_sub IS NULL
    WHERE SUB.id_producto_categoria_sub IS NULL  -- Solo categorías sin subcategorías
        AND  CA.Activo='S'
				AND (p_busqueda IS NULL OR p_busqueda = '' OR
             P.nombre LIKE CONCAT('%', p_busqueda, '%') OR 
             P.descripcion LIKE CONCAT('%', p_busqueda, '%') OR
             CA.nombre LIKE CONCAT('%', p_busqueda, '%'))
    GROUP BY CA.id_producto_categoria, CA.nombre;
    
    -- Luego obtenemos las categorías que SÍ tienen subcategorías (relación normal)
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_categorias_con_sub AS
    SELECT 
        CA.id_producto_categoria,
        TRIM(CA.nombre) AS nombre_categoria,
        TRIM(CAST(SUB.id_producto_categoria_sub AS CHAR)) AS id_producto_categoria_sub,
        TRIM(SUB.nombre) AS nombre_categoria_sub,
        COUNT(DISTINCT P.id_producto) AS total_productos
    FROM administracion_producto_categoria CA
    JOIN administracion_producto_categoria_sub SUB ON CA.id_producto_categoria = SUB.id_producto_categoria
    LEFT JOIN administracion_producto P ON SUB.id_producto_categoria_sub = P.id_producto_categoria_sub 
                                      AND CA.id_producto_categoria = P.id_producto_categoria
    WHERE  SUB.Activo='S' AND 
					(p_busqueda IS NULL OR p_busqueda = '' OR
           P.nombre LIKE CONCAT('%', p_busqueda, '%') OR 
           P.descripcion LIKE CONCAT('%', p_busqueda, '%') OR
           CA.nombre LIKE CONCAT('%', p_busqueda, '%') OR
           SUB.nombre LIKE CONCAT('%', p_busqueda, '%'))
    GROUP BY CA.id_producto_categoria, CA.nombre, SUB.id_producto_categoria_sub, SUB.nombre;
    
    -- Unimos ambos resultados - MOSTRAMOS TODAS las categorías sin subcategorías
    SELECT 
        ROW_NUMBER() OVER (
            ORDER BY 
                CASE 
                    WHEN id_producto_categoria_sub IS NULL THEN 1 
                    ELSE 0 
                END,
                id_producto_categoria,
                id_producto_categoria_sub
        ) AS RowIndex,
        id_producto_categoria,
        nombre_categoria,
        COALESCE(id_producto_categoria_sub, '') AS id_producto_categoria_sub,
        COALESCE(nombre_categoria_sub, '') AS nombre_categoria_sub,
        total_productos
    FROM (
        SELECT * FROM temp_categorias_sin_sub  WHERE total_productos > 0
        UNION ALL
        SELECT * FROM temp_categorias_con_sub
       -- WHERE total_productos > 0  -- Para categorías con subcategorías, solo mostramos si tienen productos
    ) AS combined_data
    ORDER BY 
        CASE 
            WHEN id_producto_categoria_sub IS NULL THEN 1 
            ELSE 0 
        END,
        id_producto_categoria,
        id_producto_categoria_sub;
    
    -- Limpiamos las tablas temporales
    DROP TEMPORARY TABLE IF EXISTS temp_categorias_sin_sub;
    DROP TEMPORARY TABLE IF EXISTS temp_categorias_con_sub;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_PRODUCTO_LISTAR_GALERIA_CATEGORIA_FILTRADO
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_PRODUCTO_LISTAR_GALERIA_CATEGORIA_FILTRADO`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_PRODUCTO_LISTAR_GALERIA_CATEGORIA_FILTRADO`(IN p_busqueda VARCHAR(255),
    IN p_categorias_con_sub TEXT,
    IN p_subcategorias TEXT, 
    IN p_categorias_sin_sub TEXT,
    IN p_tiene_filtros TINYINT(1))
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE cat_id INT;
    DECLARE subcat_id INT;
    
    -- Crear tabla temporal para categorías seleccionadas con subcategorías
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_cat_con_sub (
        id_categoria INT PRIMARY KEY
    );
    
    -- Crear tabla temporal para subcategorías seleccionadas
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_subcategorias (
        id_subcategoria INT PRIMARY KEY
    );
    
    -- Crear tabla temporal para categorías seleccionadas sin subcategorías
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_cat_sin_sub (
        id_categoria INT PRIMARY KEY
    );
    
    -- Poblar tabla de categorías con subcategorías
    IF p_categorias_con_sub IS NOT NULL AND p_categorias_con_sub != '' THEN
        SET @sql = CONCAT('INSERT IGNORE INTO temp_cat_con_sub (id_categoria) VALUES (', 
                         REPLACE(p_categorias_con_sub, ',', '),('), ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
    
    -- Poblar tabla de subcategorías
    IF p_subcategorias IS NOT NULL AND p_subcategorias != '' THEN
        SET @sql = CONCAT('INSERT IGNORE INTO temp_subcategorias (id_subcategoria) VALUES (', 
                         REPLACE(p_subcategorias, ',', '),('), ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
    
    -- Poblar tabla de categorías sin subcategorías
    IF p_categorias_sin_sub IS NOT NULL AND p_categorias_sin_sub != '' THEN
        SET @sql = CONCAT('INSERT IGNORE INTO temp_cat_sin_sub (id_categoria) VALUES (', 
                         REPLACE(p_categorias_sin_sub, ',', '),('), ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
    
    -- Crear tabla temporal para resultados
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_resultados (
        id_producto_categoria INT,
        nombre_categoria VARCHAR(255),
        id_producto_categoria_sub VARCHAR(10),
        nombre_categoria_sub VARCHAR(255),
        total_productos INT,
        orden_categoria INT,
        orden_subcategoria INT
    );
    
    -- CASO 1: Categorías sin subcategorías (cuando están seleccionadas O no hay filtros)
    INSERT INTO temp_resultados
    SELECT 
        CA.id_producto_categoria,
        TRIM(CA.nombre) AS nombre_categoria,
        '' AS id_producto_categoria_sub,
        '' AS nombre_categoria_sub,
        COUNT(DISTINCT P.id_producto) AS total_productos,
        CA.id_producto_categoria as orden_categoria,
        0 as orden_subcategoria
    FROM administracion_producto_categoria CA
    LEFT JOIN administracion_producto_categoria_sub SUB ON CA.id_producto_categoria = SUB.id_producto_categoria
    LEFT JOIN administracion_producto P ON CA.id_producto_categoria = P.id_producto_categoria 
                                     AND P.id_producto_categoria_sub IS NULL
                                     AND P.Activo = 'S'
    WHERE SUB.id_producto_categoria_sub IS NULL  -- Solo categorías que NO tienen subcategorías
        AND CA.Activo = 'S'
        AND (p_busqueda IS NULL OR p_busqueda = '' OR
             P.nombre LIKE CONCAT('%', p_busqueda, '%') OR 
             P.descripcion LIKE CONCAT('%', p_busqueda, '%') OR
             CA.nombre LIKE CONCAT('%', p_busqueda, '%'))
        AND (
            p_tiene_filtros = 0 OR  -- Sin filtros, mostrar todo
            EXISTS(SELECT 1 FROM temp_cat_sin_sub WHERE id_categoria = CA.id_producto_categoria)  -- Categoría sin sub seleccionada
        )
    GROUP BY CA.id_producto_categoria, CA.nombre
    HAVING total_productos > 0;
    
    -- CASO 2: Subcategorías (cuando están seleccionadas O no hay filtros)
    INSERT INTO temp_resultados
    SELECT 
        CA.id_producto_categoria,
        TRIM(CA.nombre) AS nombre_categoria,
        TRIM(CAST(SUB.id_producto_categoria_sub AS CHAR)) AS id_producto_categoria_sub,
        TRIM(SUB.nombre) AS nombre_categoria_sub,
        COUNT(DISTINCT P.id_producto) AS total_productos,
        CA.id_producto_categoria as orden_categoria,
        SUB.id_producto_categoria_sub as orden_subcategoria
    FROM administracion_producto_categoria CA
    JOIN administracion_producto_categoria_sub SUB ON CA.id_producto_categoria = SUB.id_producto_categoria
    LEFT JOIN administracion_producto P ON SUB.id_producto_categoria_sub = P.id_producto_categoria_sub 
                                      AND CA.id_producto_categoria = P.id_producto_categoria
                                      AND P.Activo = 'S'
    WHERE SUB.Activo = 'S' 
        AND CA.Activo = 'S'
        AND (p_busqueda IS NULL OR p_busqueda = '' OR
             P.nombre LIKE CONCAT('%', p_busqueda, '%') OR 
             P.descripcion LIKE CONCAT('%', p_busqueda, '%') OR
             CA.nombre LIKE CONCAT('%', p_busqueda, '%') OR
             SUB.nombre LIKE CONCAT('%', p_busqueda, '%'))
        AND (
            p_tiene_filtros = 0 OR  -- Sin filtros, mostrar todo
            EXISTS(SELECT 1 FROM temp_subcategorias WHERE id_subcategoria = SUB.id_producto_categoria_sub) OR  -- Subcategoría seleccionada
            EXISTS(SELECT 1 FROM temp_cat_con_sub WHERE id_categoria = CA.id_producto_categoria)  -- Categoría padre seleccionada
        )
    GROUP BY CA.id_producto_categoria, CA.nombre, SUB.id_producto_categoria_sub, SUB.nombre;
    
    -- Devolver resultados finales ordenados
    SELECT 
        ROW_NUMBER() OVER (
            ORDER BY 
                CASE 
                    WHEN id_producto_categoria_sub = '' THEN 1 
                    ELSE 0 
                END,
                orden_categoria,
                orden_subcategoria
        ) AS RowIndex,
        id_producto_categoria,
        nombre_categoria,
        id_producto_categoria_sub,
        nombre_categoria_sub,
        total_productos
    FROM temp_resultados
    WHERE total_productos > 0
    ORDER BY 
        CASE 
            WHEN id_producto_categoria_sub = '' THEN 1 
            ELSE 0 
        END,
        orden_categoria,
        orden_subcategoria;
    
    -- Limpiar tablas temporales
    DROP TEMPORARY TABLE IF EXISTS temp_cat_con_sub;
    DROP TEMPORARY TABLE IF EXISTS temp_subcategorias;
    DROP TEMPORARY TABLE IF EXISTS temp_cat_sin_sub;
    DROP TEMPORARY TABLE IF EXISTS temp_resultados;
    
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_PRODUCTO_LISTAR_MAS_VENDIDOS
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_PRODUCTO_LISTAR_MAS_VENDIDOS`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_PRODUCTO_LISTAR_MAS_VENDIDOS`()
BEGIN
		 			
		WITH listaImagenes AS (
		SELECT * FROM administracion_producto_imagen 
		-- WHERE imagen_principal=1
		)
	  SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_producto) AS RowIndex
					,AE.id_producto
				 , AE.nombre AS titulo
				 , AE.descripcion
				 , AE.precio
				  , AE.precio_old
				 , AE.stock
				 , AE.corte_tiempo_promocion

				 , AE.created_at
				 , AE.Activo
				 , APC.nombre AS nombre_categoria
				 , AE.url_imagen
				 , WF.id_usuario
				 , WF.id_favorito
				 , API.estado_mas_vendido
 ,CASE WHEN AE.numero_estrellas IS NULL OR AE.numero_estrellas ='null' THEN 0 ELSE AE.numero_estrellas END AS  numero_estrellas
					
		FROM  administracion_producto AE 
		INNER JOIN administracion_producto_categoria APC ON AE.id_producto_categoria=APC.id_producto_categoria
		LEFT JOIN listaImagenes API ON AE.id_producto=API.id_producto
		LEFT JOIN web_favoritos	 WF ON AE.id_producto=WF.id_producto
		WHERE  AE.id_producto_tipo = 1 -- 1. Indica Lo mas vendidos
		AND AE.Activo='S'
		ORDER BY AE.id_producto ASC;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_PRODUCTO_OBTENER
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_PRODUCTO_OBTENER`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_PRODUCTO_OBTENER`(IN id_producto_ VARCHAR(255),
    IN p_id_usuario VARCHAR(255))
BEGIN

    -- Declarar variables
    DECLARE p_ischeck TINYINT DEFAULT 0;
    DECLARE producto_activo CHAR(1);

    -- Obtener el estado activo del producto
    SELECT AE.Activo INTO producto_activo 
    FROM administracion_producto AE 
    WHERE AE.id_producto = id_producto_
    LIMIT 1;

    -- Si el producto no existe o está inactivo (Activo = 'N'), retornar conjunto vacío
    IF producto_activo IS NULL OR producto_activo = 'N' THEN
        SELECT 
            '' as id_producto, 
            '' as titulo, 
            '' as descripcion, 
            '' as precio, 
            '' as stock, 
            '' as url_imagen, 
            '' as codigo_producto, 
            '' as precio_old, 
            '' as corte_tiempo_promocion, 
            '' as precio_yape,
            '' as peso_kilogramo,
            '' as paquete_medidas,
            '' as paquete_dimencion,
            '' as numero_estrellas,
            '' as es_favorito;
    ELSE
        -- Verificar si el producto está en favoritos (solo si el producto está activo)
        SET p_ischeck = (SELECT 1 FROM web_favoritos 
                         WHERE id_producto = id_producto_ 
                         AND id_usuario = p_id_usuario 
                         LIMIT 1);
                                             
        SELECT
            #===== IMAGEN PRINCIPAL =========
           AE.id_producto
         , AE.nombre AS titulo
         , AE.descripcion
         , AE.precio
         , AE.stock
         , AE.url_imagen
         , AE.codigo_producto
         , AE.precio_old
         , AE.corte_tiempo_promocion
         , AE.precio_yape
                 
         , AE.peso_kilogramo
         , AE.paquete_medidas
         , AE.paquete_dimencion

         ,CASE WHEN AE.numero_estrellas IS NULL OR AE.numero_estrellas ='null' THEN 0 ELSE AE.numero_estrellas END AS  numero_estrellas
         ,IF(p_ischeck = 1, p_id_usuario, NULL) AS es_favorito
         
        FROM  administracion_producto AE 
        LEFT JOIN administracion_producto_categoria APC ON AE.id_producto_categoria=APC.id_producto_categoria
        WHERE AE.Activo='S' AND AE.id_producto=id_producto_
        
        UNION
        
        SELECT '' , '', '', '', '', IM.url_imagen, '', "", 0, '', '', '', '', '', ''
        FROM administracion_producto_fotos IM
        WHERE IM.id_producto=id_producto_;
    END IF;
        
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_PRODUCTO_OBTENER_DETALLE
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_PRODUCTO_OBTENER_DETALLE`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_PRODUCTO_OBTENER_DETALLE`(IN codigo_producto 			VARCHAR(255))
BEGIN
			 
		WITH listaImagenes AS (
		SELECT * FROM administracion_producto_imagen 
		)
	  SELECT
					 ROW_NUMBER() OVER (ORDER BY AE.id_producto) AS RowIndex
					 
					  #===== IMAGEN PRINCIPAL =========
					 , AE.id_producto
					 , AE.nombre AS titulo
					 , AE.descripcion
					 , AE.precio
					 , AE.stock
					 , AE.url_imagen
				 
					 #===== IMAGEN SECUNDARIO =========
					 , API.id_producto_imagen
					 , API.descripcion AS img_descripcion
					 , API.titulo AS img_titulo
					 , API.precio AS img_precio
					 , API.stock AS img_stock
					 , API.url_imagen AS img_url_imagen
					
					 
					 , API.codigo_producto AS img_codigo_producto
					 -- , API.imagen_principal #borramos el estado
					 
					 , AE.created_at
					 , AE.Activo
					 , APC.nombre AS nombre_categoria
				 
					
		FROM  administracion_producto AE 
		INNER JOIN administracion_producto_categoria APC ON AE.id_producto_categoria=APC.id_producto_categoria
		LEFT JOIN listaImagenes API ON AE.id_producto=API.id_producto
		WHERE AE.id_producto=id_producto_
		ORDER BY AE.id_producto DESC;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_PRODUCTO_OBTENER_FICHA_TECNICA
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_PRODUCTO_OBTENER_FICHA_TECNICA`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_PRODUCTO_OBTENER_FICHA_TECNICA`(IN id_producto_ VARCHAR(255))
BEGIN
    -- Declarar variable para el estado del producto
    DECLARE producto_activo CHAR(1);

    -- Obtener el estado activo del producto desde la tabla principal
    SELECT AP.Activo INTO producto_activo 
    FROM administracion_producto AP 
    WHERE AP.id_producto = id_producto_
    LIMIT 1;

    -- Si el producto no existe o está inactivo (Activo = 'N'), retornar conjunto vacío
    IF producto_activo IS NULL OR producto_activo = 'N' THEN
        SELECT 
            '' AS RowIndex,
            '' AS id_producto,
            '' AS titulo,
            '' AS descripcion,
            '' AS Activo,
            '' AS orden,
            '' AS nuevo_caracteristicas,
            '' AS nuevo_titulo,
            '' AS nuevo_descripcion
        WHERE 1=0; -- Garantiza que no retorne registros
    ELSE
        -- Si el producto está activo, ejecutar la consulta normal
        SELECT
            ROW_NUMBER() OVER (ORDER BY AE.id_producto) AS RowIndex
            , AE.id_producto
            , AE.titulo
            , AE.descripcion
            , AE.Activo
            , AE.orden
            , AE.nuevo_caracteristicas
            , AE.nuevo_titulo
            , AE.nuevo_descripcion
        FROM administracion_producto_ficha_tecnica AE 
        WHERE AE.id_producto = id_producto_ AND AE.Activo = 'S'
        ORDER BY AE.orden ASC;
    END IF;
						
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for USP_WEB_PRODUCTO_OBTENER_IMAGENES
-- ----------------------------
DROP PROCEDURE IF EXISTS `USP_WEB_PRODUCTO_OBTENER_IMAGENES`;
delimiter ;;
CREATE PROCEDURE `USP_WEB_PRODUCTO_OBTENER_IMAGENES`(IN id_producto_ 			VARCHAR(255))
BEGIN
			/* 
		WITH listaImagenes AS (
		SELECT * FROM administracion_producto_imagen 
		)
		*/
	  SELECT
					 ROW_NUMBER() OVER (ORDER BY API.id_producto_imagen) AS RowIndex
					 
					 #===== IMAGEN SECUNDARIO =========
					 , API.id_producto_imagen
					 , API.descripcion 				AS img_descripcion
					 , API.titulo 						AS img_titulo
					 , API.precio 						AS img_precio
					 , API.precio_old 				AS img_precio_old
					 , API.stock 							AS img_stock
					 , API.url_imagen 				AS img_url_imagen
					 , API.codigo_producto 		AS img_codigo_producto
					 , API.numero_estrellas 		AS img_numero_estrellas
			 
					
		FROM    administracion_producto_imagen API 
		WHERE API.id_producto=id_producto_ AND API.Activo='S'
		ORDER BY API.id_producto_imagen DESC;
						
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
