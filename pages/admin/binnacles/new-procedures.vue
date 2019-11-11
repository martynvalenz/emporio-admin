<template>
	<div>
		<h2>Bitácora de Trámites Nuevos</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="services_loading">
					<v-card-title>
						<v-btn color="primary" class="mx-1" @click="addService">Servicio<v-icon right>add</v-icon></v-btn>
						<v-btn color="info" class="mx-1" @click="addCustomer">Cliente<v-icon right>person_add</v-icon></v-btn>
						<v-spacer></v-spacer>
						<v-btn-toggle mandatory v-model="service_control_view">
							<v-btn :value="0" @click="changeView(0)"><v-icon>list</v-icon></v-btn>
							<v-btn :value="1" @click="changeView(1)"><v-icon>calendar_view_day</v-icon></v-btn>
							<v-btn :value="2" @click="changeView(2)"><v-icon>view_module</v-icon></v-btn>
						</v-btn-toggle>
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
									<v-text-field v-model="search_table" v-on:keyup.enter="Reload" filled label="Buscar servicio..." clearable @click:clear="clearSearch"></v-text-field>
								</v-col>
								<v-col cols="12" sm="12" md="3" lg="3">
									<v-text-field v-model="search_invoice" v-on:keyup.enter="Reload" filled label="Buscar factura/recibo..." clearable @click:clear="clearSearch"></v-text-field>
								</v-col>
							</v-row>
							<v-row>
								<v-btn text small color="blue" @click="sortBy">
									<v-icon v-if="orderBy == 'asc'" left small>keyboard_arrow_up</v-icon>
									<v-icon v-if="orderBy == 'desc'" left small>keyboard_arrow_down</v-icon>
									<span class="caption text-lowercase">Ordenar por fecha</span>
								</v-btn>
							</v-row>
						</v-container>
					</v-card-title>
					<v-card-text v-if="user.service_control == 0">
						<v-simple-table class="elevation-3" fixed-header height="700px">
							<thead>
								<tr>
									<th class="text-left" style="width:15%">Fecha</th>
									<th class="text-left" style="width:23%">Servicio</th>
									<th class="text-left" style="width:15%">Cliente</th>
									<th class="text-center" style="width:5%">Resp</th>
									<th class="text-center" style="width:23%">Avance</th>
									<th class="text-center" style="width:7%">Cobranza</th>
									<th class="text-center" style="width:7%">Trámite</th>
									<th class="text-right" style="width:5%"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(service, index) in services" :key="index">
									<td :title="service.id">{{ service.date }}</td>
									<td>
										{{ service.code }}<span v-if="service.brand"> - {{ service.brand }}</span><span v-if="service.class"> ({{service.class}})</span>
									</td>
									<td>{{ service.customer }}</td>
									<td class="text-center">{{ service.resp }}</td>
                                    <td>
                                        
                                    </td>
									<!-- Payments -->
										<td v-if="service.status < 2" class="text-center">
											<v-chip label small v-if="service.is_payed == 0" class="warning">Pendiente</v-chip>
											<v-chip label small v-if="service.is_payed == 1" :title="service.date_payed" class="success">Pagado</v-chip>
										</td>
										<td v-else class="text-center">
											<v-chip label small v-if="service.status == 2" class="error">Cancelado</v-chip>
											<v-chip label small v-if="service.status == 3" class="error">No Registro</v-chip>
											<v-chip label small v-if="service.status == 4" class="orange darken-1">Repetido</v-chip>
										</td>
									<!-- Div -->
									<td class="text-center">
										<v-chip label small v-if="service.status == 0" class="warning">Pendiente</v-chip>
										<v-chip label small v-if="service.status == 1" class="success" :title="service.date_registered">Terminado</v-chip>
										<v-chip label small v-if="service.status == 2" color="error">Cancelado</v-chip>
										<v-chip label small v-if="service.status == 3" class="error">No Registro</v-chip>
										<v-chip label small v-if="service.status == 4" color="orange darken-1">Repetido</v-chip>
									</td>
									<!-- Status -->
									<td>
										<v-menu offset-y class="text-center">
											<template v-slot:activator="{on}">
												<v-btn v-on="on">
													<v-icon>menu</v-icon>
												</v-btn>
											</template>
											<v-list>
												<v-list-item>
													<v-list-item-content>
														<v-list-item-title>Editar</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="warning">edit</v-icon>
													</v-list-item-action>
												</v-list-item>
												<v-list-item>
													<v-list-item-content>
														<v-list-item-title>Check-list</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon>list</v-icon>
													</v-list-item-action>
												</v-list-item>
												<v-list-item>
													<v-list-item-content>
														<v-list-item-title>Comentarios</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="info">comment</v-icon>
													</v-list-item-action>
												</v-list-item>
												<v-list-item>
													<v-list-item-content>
														<v-list-item-title>Comisiones</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="green">attach_money</v-icon>
													</v-list-item-action>
												</v-list-item>
												<v-list-item>
													<v-list-item-content>
														<v-list-item-title>Facturas</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon>folder_open</v-icon>
													</v-list-item-action>
												</v-list-item>
												<v-list-item>
													<v-list-item-content>
														<v-list-item-title>Cancelar</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="error">block</v-icon>
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
					<v-card-text v-if="user.service_control == 1">
						<v-expansion-panels class="elevation-4">
							<v-expansion-panel v-for="(service, index) in services" :key="index">
								<v-expansion-panel-header v-slot="{ open }">
									<v-layout row wrap>
										<v-flex xs6 sm6 md6 lg2 xl2>
											<small>Fecha</small><br>
											{{service.date}}
										</v-flex>
										<v-flex xs12 sm12 md6 lg4 xl4>
											<small>Servicio</small><br>
											{{ service.code }}<span v-if="service.brand"> - {{ service.brand }}</span><span v-if="service.class"> ({{service.class}})</span>
										</v-flex>
										<v-flex xs12 sm12 md8 lg3 xl3>
											<small>Cliente</small><br>
											{{ service.customer }}
										</v-flex>
										<v-flex xs4 sm4 md14 lg1 xl1>
											<small>Resp</small><br>
											{{ service.resp }}
										</v-flex>
										<v-flex xs4 sm4 md12 lg1 xl1>
											<small>Cobranza</small><br>
											<v-chip label small v-if="service.is_payed == 0 && service.status < 2" class="warning">Pendiente</v-chip>
											<v-chip label small v-if="service.is_payed == 1 && service.status < 2" class="success" :title="service.date_payed">Pagado</v-chip>
											<v-chip label small v-if="service.status == 2" class="error">Cancelado</v-chip>
											<v-chip label small v-if="service.status == 3" class="error">No Registro</v-chip>
											<v-chip label small v-if="service.status == 4" class="orange darken-1">Repetido</v-chip>
										</v-flex>
										<v-flex xs4 sm4 md12 lg1 xl1>
											<small>Trámite</small><br>
											<v-chip label small v-if="service.status == 0" class="warning">Pendiente</v-chip>
											<v-chip label small v-if="service.status == 1" class="success" :title="service.date_registered">Terminado</v-chip>
											<v-chip label small v-if="service.status == 2" color="error">Cancelado</v-chip>
											<v-chip label small v-if="service.status == 3" class="error">No Registro</v-chip>
											<v-chip label small v-if="service.status == 4" color="orange darken-1">Repetido</v-chip>
										</v-flex>
									</v-layout>
								</v-expansion-panel-header>
								<v-expansion-panel-content>
									<v-layout row wrap>
										<v-flex xs4 sm4 md4 lg1 xl1>
											<small>Facturas</small><br>
											<ul class="list-style: none;" v-for="(bill, index) in service.bills" :key="index">
												<li>{{bill.folio_bill}}</li>
											</ul>
											<v-icon v-if="service.is_payed == 0 && (service.status != 2 || service.status != 4)" color="blue">add</v-icon>
										</v-flex>
										<v-flex xs4 sm4 md4 lg1 xl1>
											<small>Recibos</small><br>
											<ul class="list-style: none;" v-for="(receipt, index) in service.receipts" :key="index">
												<li>{{receipt.folio_receipt}}</li>
											</ul>
											<v-icon v-if="service.is_payed == 0 && (service.status != 2 || service.status != 4)" color="blue">add</v-icon>
										</v-flex>
										<v-flex xs4 sm4 md4 lg2 xl1>
											<small>Precio</small><br>
											$ {{ formatPrice(service.final_price) }}
										</v-flex>
										<v-flex xs4 sm4 md4 lg2 xl1>
											<small>Facturado</small><br>
											$ {{ formatPrice(service.billing) }}
										</v-flex>
										<v-flex xs4 sm4 md4 lg2 xl1>
											<small>Cobrado</small><br>
											$ {{ formatPrice(service.charged) }}
										</v-flex>
										<v-flex xs4 sm4 md4 lg2 xl1>
											<small>Saldo</small><br>
											$ {{ formatPrice(service.balance) }}
										</v-flex>
									</v-layout>
									<br>
									<v-layout row wrap>
										<v-flex xs12 sm12 md12 lg12 xl12 class="text-left">
                                            <v-tooltip>
                                                <template v-slot:activator={on}>
                                                    <v-btn dark fab small color="warning" title="Editar">
                                                        <v-icon dark color="white" v-on="on">edit</v-icon>
                                                    </v-btn>
                                                </template>
                                                <span>Editar servicio</span>
                                            </v-tooltip>
                                            <v-tooltip>
                                                <template v-slot:activator={on}>
                                                    <v-btn dark fab small color="grey" title="Proceso">
                                                        <v-icon dark>list</v-icon>
                                                    </v-btn>
                                                </template>
                                                <span>Ver progreso de check-list</span>
                                            </v-tooltip>
											<v-tooltip>
                                                <template v-slot:activator={on}>
                                                    <v-btn dark fab small color="info" title="Comentarios">
                                                        <v-icon dark>comment</v-icon>
                                                    </v-btn>
                                                </template>
                                                <span>Comentarios</span>
                                            </v-tooltip>
                                            <v-tooltip>
                                                <template v-slot:activator={on}>
                                                    <v-btn dark fab small color="green" title="Comisiones">
                                                        <v-icon dark>attach_money</v-icon>
                                                    </v-btn>
                                                </template>
                                                <span>Comisiones</span>
                                            </v-tooltip>
											<v-tooltip>
                                                <template v-slot:activator={on}>
                                                    <v-btn dark fab small color="grey" title="Facturas y Recibos">
                                                        <v-icon dark>folder_open</v-icon>
                                                    </v-btn>
                                                </template>
                                                <span>Facturas y Recibos</span>
                                            </v-tooltip>
											<v-tooltip>
                                                <template v-slot:activator={on}>
                                                    <v-btn dark fab small color="error" title="Cancelar">
                                                        <v-icon dark>block</v-icon>
                                                    </v-btn>
                                                </template>
                                                <span>Cancelar servicio</span>
                                            </v-tooltip>
										</v-flex>
									</v-layout>
								</v-expansion-panel-content>
							</v-expansion-panel> 
							
						</v-expansion-panels>
						<infinite-loading class="text-center" spinner="spiral" @infinite="infiniteScroll" ref="infiniteLoading">
							<div slot="no-more">Ya no hay más registros</div>
							<div slot="no-results">Se llegó al final de los resultados</div>
						</infinite-loading>
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>
		<Customer :customer_dialog="1" ref="customer_form"></Customer>
		<Services :service_dialog="1" ref="services_form" v-on:addService="newService($event)"></Services>
		<Bills :billing_dialog="1" ref="bills_form"></Bills>
	</div>
</template>

<script>
import Customer from '@/components/Customer'
import Services from '@/components/Services'
import Bills from '@/components/Bills'
import axios from 'axios'
export default {
	layout: 'admin',
	middleware: 'auth',
	head:{
        title: 'Control de Servicios'
	},
	components:{Customer, Services, Bills},

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
			orderBy:'desc',
			page:1,
			service_control_view:0
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
			// this.payed_status = 'todo';

			this.statuses = [
				{id:'todo', status:'Todo'},
				{id:0, status:'Pendiente'},
				{id:1, status:'Terminado'},
				{id:2, status:'Cancelado'},
				{id:3, status:'No Registro'},
				{id:4, status:'Repetido'}
			];
			// this.status = 'todo';
			this.search_table = '';
			this.search_invoice = '';
			this.service_control_view = this.user.service_control;
		},

		async Load(){
			this.services_loading = true;
			await this.$axios.post(this.url, {search:this.search_table, invoice:this.search_invoice, status:this.status, payed_status:this.payed_status, orderBy:this.orderBy})
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
				this.$axios.post(this.url, {search:this.search_table, invoice:this.search_invoice, status:this.status, payed_status:this.payed_status, orderBy:this.orderBy})
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

		addCustomer(){
			this.$refs.customer_form.addCustomer();
		},

		addService(){
			this.$refs.services_form.addService();
		},

		addBill(){
			this.$refs.bills_form.addBill();
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

	ul {
		list-style-type: none;
	}

	li{
		margin-left: -20px !important;
		text-align: left !important;
	}
</style>