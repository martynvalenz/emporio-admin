<template>
	<div>
		<Progress ref="process_form" v-on:updateProgress="updateProgress($event)"></Progress>
		<h2>Comisiones sin asignar</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="services_loading">
					<v-card-title>
						<v-btn color="green" dark class="mx-1" to="/admin/comissions/assigned" router exact>Asignadas<v-icon right>arrow_upward</v-icon></v-btn>
					</v-card-title>
					<v-card-title>
						<v-container fluid>
							<v-row>
								<v-col cols="12" sm="6" md="3" lg="2">
									<v-select @change="Reload" v-model="type" :items="types" item-value="value" item-text="status" filled label="Tipo"></v-select>
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
                                    <th class="text-left" style="width:25%;">Servicio</th>
                                    <th class="text-center" style="width:15%">Creado</th>
                                    <th class="text-center" style="width:10%">Comisión</th>
                                    <th class="text-right" style="width:14%">Utilizado</th>
                                    <th class="text-right" style="width:14%">Porcentaje</th>
                                    <th class="text-right" style="width:14%">Disponible</th>
                                    <td style="width:8%" colspan="1"></td>
                                </tr>
							</thead>
							<tbody>
								<tr v-for="(service, index) in services" :key="index">
                                    <td :title="service.id">
										{{ service.code }}<span v-if="service.brand"> - {{ service.brand }}</span><span v-if="service.class"> ({{service.class}})</span>
                                        <br>
                                        Cliente: {{service.customer}}
									</td>
									<td class="text-center">{{ service.created_at }}</td>
                                    <td class="text-center">
                                        <v-chip label small v-if="service.type == 0" class="purple" dark>Venta</v-chip>
                                        <v-chip label small v-if="service.type == 1" class="primary">Operativa</v-chip>
                                        <v-chip label small v-if="service.type == 2" class="green" dark>Gestión</v-chip>
                                    </td>
                                    <td class="text-right">{{formatPrice(service.used)}}</td>
                                    <td class="text-right">{{formatPrice(service.percent)}}</td>
                                    <td class="text-right">{{ formatPrice(service.available) }}</td>
									<td v-if="service.available > 0">
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
                                    <td v-else></td>
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
		<Comissions ref="comissions_dialog" v-on:updateComission="Reload()"></Comissions>
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
			services:[],
			services_loading:false,
            search_table:'',
			status:'todo',
			types:[
                {value:'todo', status:'Todo'},
                {value:0, status:'Venta'},
                {value:1, status:'Operativa'},
                {value:2, status:'Gestión'},
            ],
			orderBy:'asc',
			page:1,
			service_control_view:0
		}
	},

	computed: {
		url(){
			return `${process.env.api}/api/comissions-unasigned?page=${this.page}`
		}
    },

	created(){
		this.loadFilters();
		this.Load();
	},

	methods:{
		loadFilters(){
			this.search_table = '';
            this.type = 'todo';
            this.orderBy = 'asc';
		},

		async Load(){
			this.services_loading = true;
			await this.$axios.post(this.url, {search:this.search_table, type:this.type, orderBy:this.orderBy})
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
				this.$axios.post(this.url, {search:this.search_table, type:this.type, orderBy:this.orderBy})
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
			this.$refs.comissions_dialog.showComissions(service.id, 'comis');
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