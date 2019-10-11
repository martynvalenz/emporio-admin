<template>
    <v-app :dark="dark">
        <v-navigation-drawer
            v-model="drawer"
            :mini-variant="miniVariant"
			:expand-on-hover="expand"
            clipped
            fixed
            app
            nav
            >
            <v-list dense nav>
                <v-list-item router exact to="/admin/perfil">
                    <v-list-item-avatar class="elevation-4">
                        <v-img :src="user.avatar_img"></v-img>
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <h4>{{ user.name }} {{ user.last_name }}</h4>
                        <small>{{ user.role }}</small>
                    </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
                <v-subheader>Principal</v-subheader>
                <v-list-item router exact to="/admin">
                    <v-list-item-action>
                        <v-icon>dashboard</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Dashboard</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-group prepend-icon="event_seat" no-action>
                    <template v-slot:activator>
                        <v-list-item-content>
                            <v-list-item-title>Dirección</v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Autorizar Servicios</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>beenhere</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Comisiones</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>money</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Sueldos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>money</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Bancos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>account_balance</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>

                <v-list-group prepend-icon="bar_chart" no-action>
                    <template v-slot:activator>
                        <v-list-item-content>
                            <v-list-item-title>Indicadores</v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Metas</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>touch_app</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>

                <v-divider></v-divider>
                <v-subheader>Servicios</v-subheader>

                <v-list-group prepend-icon="people" no-action>
                    <template v-slot:activator>
                        <v-list-item-content>
                            <v-list-item-title>Clientes</v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <v-list-item router exact to="/admin/clientes/estrategias">
                        <v-list-item-content>
                            <v-list-item-title>Estrategias</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>thumb_up</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item router exact to="/admin/clientes">
                        <v-list-item-content>
                            <v-list-item-title>Listado de Clientes</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>people_outline</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>

                <v-list-item router exact to="/admin/control-servicios">
                    <v-list-item-action>
                        <v-icon>business_center</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Control de Servicios</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-group prepend-icon="work" no-action>
                    <template v-slot:activator>
                        <v-list-item-content>
                            <v-list-item-title>Servicios</v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Categorías</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>category</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Subcategorías</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>device_hub</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Catálogo de Servicios</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>chrome_reader_mode</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Descuentos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>money_off</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Check List</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>toc</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Pago de Derechos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>attach_money</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>

                <v-list-group prepend-icon="bookmarks" no-action>
                    <template v-slot:activator>
                        <v-list-item-content>
                            <v-list-item-title>Bitácoras</v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Trámites Nuevos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>create_new_folder</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Estudios de Factibilidad</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>search</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Negativas</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>block</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Requisitos y Objeciones</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>unarchive</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Títulos y Certificados</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>assignment_late</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>

                <v-list-group prepend-icon="assignment" no-action>
                    <template v-slot:activator>
                        <v-list-item-content>
                            <v-list-item-title>Estatus de Trámites</v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Signos Distintivos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Declaraciones de Uso</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Búsqueda Técnica</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Invenciones</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Dictamen Previo</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Códigos de Barra</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Registro de Obras</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Reserva de Derechos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Juicios</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Franquicias</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>

                <v-list-item router exact>
                    <v-list-item-action>
                        <v-icon>money</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Comisiones</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider>
				<v-subheader>Adminstración</v-subheader>

                <v-list-group prepend-icon="insert_drive_file" no-action>
                    <template v-slot:activator>
                        <v-list-item-content>
                            <v-list-item-title>Facturación</v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Facturas</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>description</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Recibos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>receipt</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Cuentas por Cobrar</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>account_balance_wallet</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>

                <v-list-group prepend-icon="money" no-action>
                    <template v-slot:activator>
                        <v-list-item-content>
                            <v-list-item-title>Finanzas</v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Ingresos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon style="color:green">money</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Egresos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon style="color:red">money</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Tarjetas de Crédito</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>credit_card</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Cuentas por Pagar</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>account_balance_wallet</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Bancos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>account_balance</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>

                <v-list-item router exact>
                    <v-list-item-action>
                        <v-icon>assignment_ind</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Nómina y Comisiones</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider>
				<v-subheader>Aplicaciones</v-subheader>

                <v-list-item router exact>
                    <v-list-item-action>
                        <v-icon>format_list_numbered</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Tareas / Actividades</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item router exact>
                    <v-list-item-action>
                        <v-icon>date_range</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Calendario</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                
                <v-list-item router exact>
                    <v-list-item-action>
                        <v-icon>mail_outline</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Mensajes</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider>
				<v-subheader>Página Web</v-subheader>

                <v-list-item router exact>
                    <v-list-item-action>
                        <v-icon>public</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Ir a Página Web</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-group prepend-icon="store" no-action>
                    <template v-slot:activator>
                        <v-list-item-content>
                            <v-list-item-title>Franquicias</v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Listado de Franquicias</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>

                <v-divider></v-divider>
				<v-subheader>Ajustes</v-subheader>

                <v-list-group prepend-icon="person" no-action>
                    <template v-slot:activator>
                        <v-list-item-content>
                            <v-list-item-title>Usuarios</v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Listado de Usuarios</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>person_outline</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Puestos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>accessibility_new</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Permisos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>vpn_key</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>

                <v-list-group prepend-icon="timeline" no-action>
                    <template v-slot:activator>
                        <v-list-item-content>
                            <v-list-item-title>Histórico</v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Servicios</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>business_center</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Facturas</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>description</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Recibos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon>receipt</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Ingresos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon style="color:green">money</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Egresos</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon style="color:red">money</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>
                
                <v-list-group prepend-icon="build" no-action>
                    <template v-slot:activator>
                        <v-list-item-content>
                            <v-list-item-title>Ajustes</v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Datos Fiscales</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Formas de Pago</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Tipos de Cambio</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Porcentaje IVA</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Clases</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content router exact>
                            <v-list-item-title>Estatus</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon></v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>

                <v-divider></v-divider>

				<v-list-item>
                    <v-list-item-action>
                        <v-switch v-model="$vuetify.theme.dark" @change="changeDarkMode" color="primary"></v-switch>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Tema</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-app-bar
            fixed
            app
            clipped-left
            clipped-right
            >
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
            <v-btn
                icon
                @click.stop="miniVariant = !miniVariant"
                class="big-menu"
                >
                <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
            </v-btn>
            <v-toolbar-title>
                <v-toolbar-title>
                    <img src="/images/logos/emporio-logo.png" style="width: auto; height: 45px;" />
                </v-toolbar-title>
            </v-toolbar-title>
            <v-spacer />
            <div class="big-menu">
				<!-- <v-btn text rounded>
					Soporte <v-icon>headset_mic</v-icon>
				</v-btn> -->
				<v-btn icon>
					<v-icon>date_range</v-icon>
				</v-btn>
                <v-btn icon>
					<v-icon>gavel</v-icon>
				</v-btn>
                <v-btn icon>
					<v-icon>assignment_turned_in</v-icon>
				</v-btn>
                <v-btn icon>
					<v-icon>device_hub</v-icon>
				</v-btn>
                
			</div>
            <v-btn icon>
					<v-icon>mail_outline</v-icon>
				</v-btn>
			<v-btn icon> 
                <v-icon>notifications</v-icon>
            </v-btn>
            <template v-if="authenticated">
                <div class="text-center">
                    <v-menu offset-y>
                        <template v-slot:activator="{ on }">
                            <v-avatar
                                class="elevation-15"
                                dark
                                color="grey lighten-1"
                                v-on="on"
                                >
                                <img :src="user.avatar_img" alt="">
                                <!-- <span class="white--text headline">C</span> -->
                            </v-avatar>
                        </template>
                        <v-list nav>
                            <v-list-item-group>
                                <v-list-item route exact to="/admin">
                                    <v-list-item-icon>
                                        <v-icon>person</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content>
                                        <v-list-item-title>Mi Perfil</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                                <v-list-item @click.prevent="Logout">
                                    <v-list-item-icon>
                                        <v-icon color="red">power_settings_new</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content>
                                        <v-list-item-title>Cerrar Sesión</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list-item-group>
                        </v-list>
                    </v-menu>
                </div>
            </template>
            <!-- <v-btn
                icon
                @click.stop="rightDrawer = !rightDrawer"
                >
                <v-icon>mdi-menu</v-icon>
            </v-btn> -->
        </v-app-bar>
        <v-content color="white">
            <v-container fluid>
                <nuxt />
            </v-container>
        </v-content>
        <!-- <v-navigation-drawer
            v-model="rightDrawer"
            :right="right"
            temporary
            fixed
            >
            <v-list>
                <v-list-item @click.native="right = !right">
                    <v-list-item-action>
                        <v-icon light>
                            mdi-repeat
                        </v-icon>
                    </v-list-item-action>
                    <v-list-item-title>Switch drawer (click me)</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-navigation-drawer> -->
        <v-footer
            clipped
            style="position: relative"
            dark
            color="#093697"
            >
            <span></span>
            <v-spacer></v-spacer>
            <span>Emporio Legal | &copy;2019</span>
        </v-footer>
        
    </v-app>
</template>

<script>
export default {
	data () {
		return {
            drawer: true,
            miniVariant: false,
            fixed: false,
            right: true,
            rightDrawer: false,
            chatDrawer: false,
            chatLabel: false,
            title: 'Emporio Legal',
			dark:false,
            expand: false,
            user_image: ''
		}
    },

    created(){
        this.darkMode();
    },
    
    methods:{
        darkMode(){
            // if(this.user.dark == 1){
            //     this.dark = true;
            // }
            // else{
            //     this.dark = false;
            // }
            // this.$vuetify.theme = user.dark;
        },

        changeDarkMode(){

        },

        Logout(){
            this.$auth.logout()
            .then(res => {
                this.$router.push('/');
            })
        }
    }
}
</script>

<style>
    *{
        font-family: 'Lucida Sans Regular';
    }

    h1, h2, h3, h4, h5, h6{
        font-family: 'Lucida Sans Regular';
    }
    
    .router-linker{
		text-decoration: none;
	}

	.router-linker, a:hover{
		text-decoration: none;
	}

    .fas, .far, .fa{
		padding-left: 0.5em;
	}

    .dark-blue{
        background-color: #01579B;
    }

    .light-grey{
        background-color: #B0BEC5;
    }

	@media (max-width: 1199px)
	{
		.big-menu{
			display: none;
		}
	}

    tbody tr:nth-of-type(odd) {
        background-color: rgba(0, 0, 0, .05);
    }
</style>
