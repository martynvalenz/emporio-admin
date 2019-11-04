<template>
	<div>
		<h2>Control de Servicios</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="services_loading">
					<v-card-title>
						<v-btn color="primary" class="mx-1" @click="addService">Servicio<v-icon right>add</v-icon></v-btn>
						<v-btn color="info" class="mx-1" @click="addCustomer">Cliente<v-icon right>person_add</v-icon></v-btn>
						<v-btn color="secondary" class="mx-1">Factura/Recibo<v-icon right>add</v-icon></v-btn>
						<v-spacer></v-spacer>
						<!-- <v-btn-toggle mandatory v-model="user.service_control">
							<v-btn :value="0" @click="changeView(0)"><v-icon>list</v-icon></v-btn>
							<v-btn :value="1" @click="changeView(1)"><v-icon>calendar_view_day</v-icon></v-btn>
							<v-btn :value="2" @click="changeView(2)"><v-icon>view_module</v-icon></v-btn>
						</v-btn-toggle> -->
						<v-btn class="ml-2" icon @click="Reload"><v-icon>sync</v-icon></v-btn>
					</v-card-title>
					<v-card-title>
						<v-container fluid>
							<v-row>
								<v-col cols="12" sm="6" md="3" lg="2">
									<v-select @change="Reload" v-model="status" :items="statuses" item-value="id" item-text="status" filled label="Trámite"></v-select>
								</v-col>
								<v-col cols="12" sm="6" md="3" lg="2">
									<v-select @change="Reload" v-model="payed_status" :items="payed_statuses" item-value="id" item-text="status" filled label="Cobranza"></v-select>
								</v-col>
								<v-col cols="12" sm="12" md="3" lg="5">
									<v-text-field v-model="search_table" @change="Reload" filled label="Buscar servicio..." clearable @click:clear="clearSearch"></v-text-field>
								</v-col>
								<v-col cols="12" sm="12" md="3" lg="3">
									<v-text-field v-model="search_invoice" @change="Reload" filled label="Buscar factura/recibo..." clearable @click:clear="clearSearch"></v-text-field>
								</v-col>
							</v-row>
						</v-container>
					</v-card-title>
					<v-card-text >
						<v-simple-table class="elevation-1" >
							<thead>
								<tr>
									<th class="text-left" style="width:12%">Fecha</th>
									<th class="text-left" style="width:21%">Servicio</th>
									<th class="text-left" style="width:15%">Cliente</th>
									<th class="text-left" style="width:8%">Factura</th>
									<th class="text-left" style="width:8%">Recibo</th>
									<th class="text-center" style="width:10%">Precio</th>
									<th class="text-left" style="width:7%">Resp</th>
									<th class="text-left" style="width:7%">Cobranza</th>
									<th class="text-left" style="width:7%">Trámite</th>
									<th class="text-right" style="width:5%"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(service, index) in services" :key="index">
									<td title="service.id">{{ service.date }}</td>
									<td>{{ service.code }} - {{ service.brand }}<span v-if="service.class"> ({{service.class}})</span></td>
									<td>{{ service.customer }}</td>
									<td></td>
									<td></td>
									<td class="text-right">{{ formatPrice(service.final_price) }}</td>
									<td>{{ service.resp }}</td>
									<td></td>
									<td></td>
									<td>
										<v-menu offset-y class="text-center">
											<template v-slot:activator="{on}">
												<v-btn v-on="on">
													<v-icon>menu</v-icon>
												</v-btn>
											</template>
											<v-list>
												<v-list-item>
													<v-list-item-title>Editar</v-list-item-title>
												</v-list-item>
												<v-list-item>
													<v-list-item-title>Detalles</v-list-item-title>
												</v-list-item>
												<v-list-item>
													<v-list-item-title>Comentarios</v-list-item-title>
												</v-list-item>
												<v-list-item>
													<v-list-item-title>Comisiones</v-list-item-title>
												</v-list-item>
												<v-list-item>
													<v-list-item-title>Facturas</v-list-item-title>
												</v-list-item>
												<v-list-item>
													<v-list-item-title>Cancelar</v-list-item-title>
												</v-list-item>
											</v-list>
										</v-menu>
									</td>
								</tr>
								<tr>
									<td style="width:100%" colspan="10">
										<infinite-loading class="text-center" spinner="spiral" @infinite="infiniteScroll" ref="infiniteLoading">
											<div slot="no-more">Ya no hay más registros</div>
											<div slot="no-results">Se llegó al final de los resultados</div>
										</infinite-loading>
									</td>
								</tr>
							</tbody>
						</v-simple-table>
						<!-- <v-expansion-panels class="elevation-4">
							<v-expansion-panel>
								<v-expansion-panel-header v-slot="{ open }">
									<v-layout row wrap>
										<v-flex xs6 sm6 md4 lg2 xl2>
											<small>Fecha</small><br>
											01-01-2018
										</v-flex>
										<v-flex xs6 sm6 md12 lg4 xl4>
											<small>Servicio</small><br>
											RM - La pacotilla
										</v-flex>
										<v-flex xs6 sm6 md8 lg3 xl3>
											<small>Cliente</small><br>
											la pacotilla
										</v-flex>
										<v-flex xs6 sm6 md12 lg1 xl1>
											<small>Cobranza</small><br>
											<v-chip color="success">Pagado</v-chip>
										</v-flex>
										<v-flex xs6 sm6 md12 lg1 xl1>
											<small>Trámite</small><br>
											<v-chip color="warning">Pendiente</v-chip>
										</v-flex>
									</v-layout>
								</v-expansion-panel-header>
								<v-expansion-panel-content>
									tester
								</v-expansion-panel-content>
							</v-expansion-panel> 
							
						</v-expansion-panels>
						<infinite-loading class="text-center" spinner="spiral" @infinite="infiniteScroll" ref="infiniteLoading">
							<div slot="no-more">Ya no hay más registros</div>
							<div slot="no-results">Se llegó al final de los resultados</div>
						</infinite-loading>-->
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>
		<Customer :customer_dialog="1" ref="customer_form"></Customer>
		<Services :service_dialog="1" ref="services_form" v-on:addService="newService($event)"></Services>
		<!-- <Bills :bills_dialog="1" ref="services_form" v-on:addService="newBill($event)"></Bills> -->
	</div>
</template>

<script>
import Customer from '@/components/Customer'
import Services from '@/components/Services'
import axios from 'axios'
export default {
	layout: 'admin',
	middleware: 'auth',
	head:{
        title: 'Control de Servicios'
	},
	components:{Customer, Services},

	data(){
		return{
			//Data
			services:[],
			services_loading:false,
			search_table:'',
			search_invoice:'',
			status:'todo',
			statuses:[],
			payed_status:'todo',
			payed_statuses:[],
			page:1
		}
	},

	computed: {
		url(){
			return `${process.env.api}/api/services-control?page=${this.page}`
		}
	},

	created(){
		this.loadFilters();
		this.Load();
	},

	methods:{
		loadFilters(){
			this.payed_statuses = [
				{id:'todo', status:'Todo'},
				{id:0, status:'Pendiente'},
				{id:1, status:'Pagado'}
			];
			this.status = 'todo';

			this.statuses = [
				{id:'todo', status:'Todo'},
				{id:0, status:'Pendiente'},
				{id:1, status:'Terminado'},
				{id:2, status:'Cancelado'},
				{id:3, status:'No Registro'},
				{id:4, status:'Repetido'}
			];
			this.payed_status = 'todo';
		},

		async Load(){
			this.services_loading = true;
			await this.$axios.post(this.url, {search:this.search_table, invoice:this.search_invoice, status:this.status, payed_status:this.payed_status})
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
				this.$axios.post(this.url, {search:this.search_table, invoice:this.search_invoice, status:this.status, payed_status:this.payed_status})
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
			this.search_table = '';
			this.search_invoice = '';
			this.status = '';
			this.payed_status = '';
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
		
		formatPrice(value) {
			let val = (value/1).toFixed(2).replace('.,', '.')
			return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},

		addCustomer(){
			this.$refs.customer_form.addCustomer();
		},

		addService(){
			this.$refs.services_form.addService();
		},

		formatPrice(value) {
			let val = (value/1).toFixed(2).replace('.,', '.')
			return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},

		changeView(val){

		},

		newService(data){
			this.services.unshift(data);
		}
	}
}
</script>	

<style>
	small{
		color: grey !important;
	}
</style>