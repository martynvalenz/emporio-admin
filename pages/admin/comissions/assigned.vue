<template>
	<div>
		<Progress ref="process_form" v-on:updateProgress="updateProgress($event)"></Progress>
		<h2>Comisiones Asignadas</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="services_loading">
					<v-card-title>
						<v-btn color="primary" class="mx-1" @click="showAsigned">Liberadas por usuario<v-icon right>remove_red_eye</v-icon></v-btn>
						<v-btn color="orange" dark class="mx-1" to="/admin/comissions/unassigned" router exact>Sin Asignar<v-icon right>arrow_downward</v-icon></v-btn>
					</v-card-title>
					<v-card-title>
						<v-container fluid>
							<v-row>
								<v-col cols="12" xs="12" sm="12" md="6" lg="4">
									<v-select @change="Reload" v-model="user" :items="users" item-value="id" item-text="employee" filled label="Usuario" clearable></v-select>
								</v-col>
								<v-col cols="12" sm="6" md="3" lg="2">
									<v-select @change="Reload" v-model="status" :items="statuses" item-value="value" item-text="status" filled label="Estatus"></v-select>
								</v-col>
								<v-col cols="12" sm="12" md="3" lg="5">
									<v-text-field v-model="search_table" v-on:keyup.enter="Reload" filled label="Buscar servicio..." clearable @click:clear="clearSearch"></v-text-field>
								</v-col>
							</v-row>
							<v-row>
								<v-btn text small color="blue" @click="sortBy">
									<v-icon v-if="orderBy == 'asc'" left small>keyboard_arrow_up</v-icon>
									<v-icon v-if="orderBy == 'desc'" left small>keyboard_arrow_down</v-icon>
									<span class="caption">Ordenar por fecha</span>
								</v-btn>
                                <v-spacer></v-spacer>
						        <v-btn class="ml-2" icon @click="Reload"><v-icon>sync</v-icon></v-btn>
							</v-row>
						</v-container>
					</v-card-title>
					<v-card-text>
						<v-simple-table class="elevation-3" fixed-header height="700px">
							<thead>
								<tr>
									<th class="text-left" style="width:30%;">Servicio</th>
                                    <th class="text-center" style="width:10%;">Tipo</th>
                                    <th class="text-center" style="width:11%;">Agregada</th>
                                    <th class="text-right" style="width:10%;">Porcentaje</th>
                                    <th class="text-right" style="width:12%;">Comisión</th>
                                    <th class="text-right" style="width:10%;">Responsable</th>
                                    <th class="text-center" style="width:12%;">Estatus</th>
                                    <th style="width:5%;"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(service, index) in services" :key="index">
									<td :title="service.id">
										{{ service.code }}<span v-if="service.brand"> - {{ service.brand }}</span><span v-if="service.class"> ({{service.class}})</span>
                                        <br>
                                        Cliente: {{service.customer}}
									</td>
									<td class="text-center">
                                        <v-chip label small v-if="service.comission_type == 0" class="purple" dark>Venta</v-chip>
                                        <v-chip label small v-if="service.comission_type == 1" class="primary">Operativa</v-chip>
                                        <v-chip label small v-if="service.comission_type == 2" class="green" dark>Gestión</v-chip>
                                    </td>
									<td class="text-center">{{ service.date_comission }}</td>
                                    <td class="text-right">{{formatPrice(service.comission_percent)}}%</td>
                                    <td class="text-right">{{ formatPrice(service.ammount) }}</td>
                                    <td class="text-center">{{ service.initials }}</td>
									<td class="text-center">
                                        <v-chip label small v-if="service.status == 0" class="warning">Pendiente</v-chip>
                                        <v-chip label small v-if="service.status == 1" class="primary">Liberada</v-chip>
                                        <v-chip label small v-if="service.status == 2" class="green" dark>Pagada</v-chip>
                                        <v-chip label small v-if="service.status == 3" class="error">Cancelada</v-chip>
                                    </td>
									<td>
										<v-menu offset-y class="text-center">
											<template v-slot:activator="{on}">
												<v-btn v-on="on">
													<v-icon>menu</v-icon>
												</v-btn>
											</template>
											<v-list>
												<v-list-item @click="CheckList(index)">
													<v-list-item-content>
														<v-list-item-title>Proceso</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon>list</v-icon>
													</v-list-item-action>
												</v-list-item>
												<v-list-item @click="showComissions(index)">
													<v-list-item-content>
														<v-list-item-title>Comisiones</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="green">attach_money</v-icon>
													</v-list-item-action>
												</v-list-item>
											</v-list>
										</v-menu>
									</td>
								</tr>
								<tr>
									<td style="width:100%" colspan="100%">
										<infinite-loading class="text-center" spinner="spiral" @infinite="infiniteScroll" ref="infiniteLoading">
											<div slot="no-more">Ya no hay más registros</div>
											<div slot="no-results">Se llegó al final de los resultados</div>
										</infinite-loading>
									</td>
								</tr>
							</tbody>
						</v-simple-table>
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>
		<v-dialog v-model="free_dialog" max-width="1050" height="auto" style="overflow: auto;">
			<v-card>
				<v-system-bar color="primary" dark height="55px;">
					<h2>Comisiones liberadas</h2>
					<v-spacer></v-spacer>
					<v-btn icon small @click="free_dialog = false"><v-icon color="white">close</v-icon></v-btn>
				</v-system-bar>
				<v-card-text>
					<v-row>
						<v-col cols="6" xs="6" sm="6" md="6" lg="5">
							<v-select v-model="user_id" :items="users" item-value="id" item-text="employee" outlined label="Usuario" clearable @change="getComis"></v-select>
						</v-col>
						<v-col cols="6" xs="6" sm="6" md="4" lg="2">
							<v-text-field filled readonly label="Monto" v-model="total_comis"></v-text-field>
						</v-col>
					</v-row>
					<v-row v-if="comissions.length > 0">
						<v-col cols="12" xs="12">
							<v-card class="elevation-1" :loading="comissions_loading">
								<v-card-title>
									<h4>Comisiones</h4>
									<v-spacer></v-spacer>
									<v-btn fab icon @click="getComis"><v-icon>sync</v-icon></v-btn>
								</v-card-title>
								<v-card-text>
									<v-simple-table class="elevation-4" >
										<thead>
											<tr>
												<th class="text-left" style="width:32%;">Servicio</th>
												<th class="text-center" style="width:13%;">Tipo</th>
												<th class="text-center" style="width:13%;">Agregada</th>
												<th class="text-center" style="width:14%;">Liberada</th>
												<th class="text-center" style="width:14%;">Porcentaje</th>
												<th class="text-center" style="width:15%;">Comisión</th>
											</tr>
										</thead>
										<tbody>
											<tr v-for="(comi, index) in comissions" :key="index">
												<td>{{comi.code}} - {{comi.brand}} {{comi.class}} <br>Cliente: {{comi.customer}}</td>
												<td class="text-center">
													<v-chip label small v-if="comi.comission_type == 0" class="green" dark>Venta</v-chip>
													<v-chip label small v-if="comi.comission_type == 1" class="primary">Operativa</v-chip>
													<v-chip label small v-if="comi.comission_type == 2" class="teal" dark>Gestión</v-chip>
												</td>
												<td class="text-center">{{comi.date_comission}}</td>
												<td class="text-center">{{comi.date_applied}}</td>
												<td class="text-right">{{comi.comission_percent}}%</td>
												<td class="text-right">$ {{formatPrice(comi.ammount)}}</td>
											</tr>
										</tbody>
										<tfoot>
											<tr>
												<td colspan="5"></td>
												<td class="text-right"><h4>$ {{formatPrice(total_comis)}}</h4></td>
											</tr>
										</tfoot>
									</v-simple-table>
								</v-card-text>
							</v-card>
						</v-col>
					</v-row>
					<v-row v-else>
						<v-col cols="12"><h4>No hay comisiones liberadas</h4></v-col>
					</v-row>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text @click="free_dialog = false">Cerrar</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<Comissions ref="comissions_dialog"></Comissions>
	</div>
</template>

<script>
import Progress from '@/components/Progress'
import Comissions from '@/components/Comissions'
import axios from 'axios'
export default {
	layout: 'admin',
	middleware: 'auth',
	head:{
        title: 'Comisiones'
	},
	components:{Progress, Comissions},

	data(){
		return{
			//Data
			comissions:[],
			free_dialog:false,
			comissions_loading:false,
			services:[],
			services_loading:false,
            search_table:'',
            users:[],
			user:'',
			user_id:'',
			status:'todo',
			statuses:[
                {value:'todo', status:'Todo'},
                {value:0, status:'Pendientes'},
                {value:1, status:'Liberadas'},
                {value:2, status:'Pagadas'},
                {value:3, status:'Canceladas'},
            ],
			orderBy:'asc',
			page:1,
			service_control_view:0
		}
	},

	computed: {
		url(){
			return `${process.env.api}/api/comissions?page=${this.page}`
		}, 

		total_comis: function(){
            if(this.comissions.length > 0){
                return this.comissions.reduce(function(total, item){
                    return (total * 1) + (item.ammount * 1);
                }, 0);
            }
            else{
                return 0;
            }
        },
    },

	created(){
		this.loadFilters();
		this.loadUsers();
		this.Load();
	},

	methods:{
		loadFilters(){
			this.search_table = '';
            this.status = 'todo';
            this.orderBy = 'asc';
            this.user = '';
            
		},

		async loadUsers(){
			await this.$axios.post('/api/users-list', {type:6})
			.then(res => 
			{
				this.users = res.data;
			})
		},

		async Load(){
			this.services_loading = true;
			await this.$axios.post(this.url, {search:this.search_table, status:this.status, user:this.user, orderBy:this.orderBy})
			.then(res => {
				this.services = res.data.data;
				this.services_loading = false;
			})
			.catch(error => {
				this.services_loading = false; 
			})
		},

		infiniteScroll($state){
			setTimeout(() => {
				this.page++
				this.$axios.post(this.url, {search:this.search_table, status:this.status, user:this.user, orderBy:this.orderBy})
				.then( res => {

					let services = res.data.data;

					if(services.length > 0){
						this.services = this.services.concat(services);
						$state.loaded()
					}
					else{
						$state.complete()
					}
				})
				.catch(error => {

				})
			}, 500);
		},

		clearSearch(){
			this.loadFilters();
			this.services = {};
			this.page = 1;
			this.$refs.infiniteLoading.stateChanger.reset();
			this.Load();
		},

		Reload(){
			this.services = {};
			this.page = 1;
			this.$refs.infiniteLoading.stateChanger.reset();
			this.loadUsers();
			this.Load();
		},

		sortBy(){
			if(this.orderBy == 'desc'){
				this.orderBy = 'asc';
				this.Load();
			}
			else{
				this.orderBy = 'desc';
				this.Load();
			}
		},
		
		formatPrice(value) {
			let val = (value/1).toFixed(2).replace('.,', '.')
			return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},

		async changeView(val){
			this.services_loading = true;
			this.$axios.post('/api/user/services-control-view', {service_control:val})
			.then(res => {
				this.$store.dispatch('auth/changeServicesControlView', {service_control:val})
				this.services_loading = false;
			})
		},

		CheckList(index){
			this.selected_service = index;
			const service = this.services[index];
			this.$refs.process_form.openProgress(service.id);
			
		},

		updateProgress(data){
			this.services.splice(this.selected_service, 1, data);
		},

		showComissions(index){
			const service = this.services[index];
			this.$refs.comissions_dialog.showComissions(service.id);
		},

		showAsigned(){
			this.free_dialog = true;
		}, 

		async getComis(){
			if(this.user_id){
				this.comissions_loading = true;
				await this.$axios.get(`/api/user/get-comis/${this.user_id}`)
				.then(res => {
					this.comissions = res.data;
					this.comissions_loading = false;
				})
				.catch(error => {
					console.log(error);
					this.comissions_loading = false;
				})
			}
			else{
				this.comissions = [];
			}
		}
	}
}
</script>	

<style>
	small{
		color: grey !important;
	}

	ul {
		list-style-type: none;
	}

	li{
		margin-left: -20px !important;
		text-align: left !important;
	}
</style>