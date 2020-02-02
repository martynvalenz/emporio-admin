<template>
	<div>
		<Progress ref="process_form" v-on:updateProgress="updateProgress($event)"></Progress>
		<h2>Control de Servicios</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="services_loading">
					<v-card-title>
						<v-btn color="primary" class="mx-1" @click="addService">Servicio<v-icon right>add</v-icon></v-btn>
						<v-btn color="primary" class="mx-1" @click="addPackage">Paquete<v-icon right>add</v-icon></v-btn>
						<v-btn color="info" class="mx-1" @click="addCustomer">Cliente<v-icon right>person_add</v-icon></v-btn>
						<v-btn color="secondary" class="mx-1" @click="addBill">Factura/Recibo<v-icon right>add</v-icon></v-btn>
						<!-- <v-btn color="secondary" class="mx-1">Ingreso<v-icon right>add</v-icon></v-btn> -->
						<v-spacer></v-spacer>
						<v-btn-toggle mandatory v-model="service_control_view">
							<v-btn :value="0" @click="changeView(0)"><v-icon>list</v-icon></v-btn>
							<v-btn :value="1" @click="changeView(1)"><v-icon>calendar_view_day</v-icon></v-btn>
							<!-- <v-btn :value="2" @click=""><v-icon>view_module</v-icon></v-btn> -->
						</v-btn-toggle>
						<v-btn class="ml-2" icon @click="Reload"><v-icon>sync</v-icon></v-btn>
					</v-card-title>
					<v-card-title>
						<v-container fluid>
							<v-row>
								<!-- <v-col cols="12" sm="6" md="3" lg="2">
									<v-select @change="Reload" v-model="status" :items="statuses" item-value="id" item-text="status" filled label="Trámite"></v-select>
								</v-col> -->
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
					<v-card-text v-if="service_control_view == 0">
						<v-simple-table class="elevation-3" fixed-header height="700px">
							<thead>
								<tr>
									<th class="text-left" style="width:14%">Fecha</th>
									<th class="text-left" style="width:20%">Servicio</th>
									<th class="text-left" style="width:15%">Cliente</th>
									<th class="text-right" style="width:7%">Factura</th>
									<th class="text-right" style="width:7%">Recibo</th>
									<th class="text-center" style="width:10%">Precio</th>
									<th class="text-center" style="width:6%">Resp</th>
									<th class="text-center" style="width:8%">Cobranza</th>
									<th class="text-center" style="width:8%">Trámite</th>
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
									<td class="text-center">
										<ul class="list-style: none;" v-for="(bill, index) in service.bills" :key="index">
											<a color="green" @click="editFolio(bill.id)" v-if="service.is_payed == 1 && service.status < 3">{{bill.folio}}</a>
											<a v-else @click="editFolio(bill.id)">{{bill.folio}}</a>
										</ul>
										<v-icon @click="createBill(index, 'Factura')" v-if="service.billed == 0 && service.status < 3" color="blue">add</v-icon>
									</td>
									<td class="text-center">
										<ul class="list-style: none;" v-for="(receipt, index) in service.receipts" :key="index">
											<a color="green" @click="editFolio(receipt.id)" v-if="service.is_payed == 1 && service.status < 3">{{receipt.folio}}</a>
											<a @click="editFolio(receipt.id)" v-else>{{receipt.folio}}</a>
										</ul>
										<v-icon @click="createReceipt(index, 'Recibo')" v-if="service.billed == 0 && service.status < 3" color="blue">add</v-icon>
									</td>
									<td class="text-right" :title="'Facturado:'+formatPrice(service.billing)+' | Cobrado:'+formatPrice(service.charged)+' | Saldo:'+formatPrice(service.balance)">{{ formatPrice(service.final_price) }}</td>
									<td class="text-center">{{ service.resp }}</td>
									<!-- Payments -->
									<td v-if="service.status < 3" class="text-center">
										<v-chip label small v-if="service.is_payed == 1" class="orange" dark>Pendiente</v-chip>
										<v-chip label small v-if="service.is_payed == 2" :title="service.date_payed" class="green" dark>Pagado</v-chip>
									</td>
									<td v-else class="text-center">
										<v-chip label small v-if="service.status == 3" class="error">Cancelado</v-chip>
										<v-chip label small v-if="service.status == 4" class="error">NoRegistro</v-chip>
										<v-chip label small v-if="service.status == 5" class="error">Repetido</v-chip>
									</td>
									<!-- Div -->
									<td class="text-center">
										<v-chip label small v-if="service.status == 1" class="orange" dark>Pendiente</v-chip>
										<v-chip label small v-if="service.status == 2" class="green" dark :title="service.date_registered">Terminado</v-chip>
										<v-chip label small v-if="service.status == 3" color="error">Cancelado</v-chip>
										<v-chip label small v-if="service.status == 4" class="error">NoRegistro</v-chip>
										<v-chip label small v-if="service.status == 5" color="error">Repetido</v-chip>
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
												<v-list-item @click="EditService(index)">
													<v-list-item-content>
														<v-list-item-title>Editar</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="warning">edit</v-icon>
													</v-list-item-action>
												</v-list-item>
												<v-list-item @click="CheckList(index)">
													<v-list-item-content>
														<v-list-item-title>Proceso</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon>list</v-icon>
													</v-list-item-action>
												</v-list-item>
												<v-list-item @click="showComments(index)">
													<v-list-item-content>
														<v-list-item-title>Comentarios</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="info">comment</v-icon>
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
												<v-list-item v-if="service.status > 1" @click="ServiceChangeStatus(index, 'success')">
													<v-list-item-content>
														<v-list-item-title>Activar</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="green">check</v-icon>
													</v-list-item-action>
												</v-list-item>
												<v-list-item v-else @click="ServiceChangeStatus(index, 'error')">
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
					<v-card-text v-if="service_control_view == 1">
						<v-expansion-panels class="elevation-4">
							<v-expansion-panel v-for="(service, index) in services" :key="index">
								<v-expansion-panel-header>
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
											<v-chip label small v-if="service.is_payed == 1 && service.status < 3" class="orange" dark>Pendiente</v-chip>
											<v-chip label small v-if="service.is_payed == 2 && service.status < 3" class="green" dark :title="service.date_payed">Pagado</v-chip>
											<v-chip label small v-if="service.status == 3" class="error">Cancelado</v-chip>
											<v-chip label small v-if="service.status == 4" class="error">No Registro</v-chip>
											<v-chip label small v-if="service.status == 5" class="orange darken-1">Repetido</v-chip>
										</v-flex>
										<v-flex xs4 sm4 md12 lg1 xl1>
											<small>Trámite</small><br>
											<v-chip label small v-if="service.status == 1" class="orange" dark>Pendiente</v-chip>
											<v-chip label small v-if="service.status == 2" class="green" dark :title="service.date_registered">Terminado</v-chip>
											<v-chip label small v-if="service.status == 3" color="error">Cancelado</v-chip>
											<v-chip label small v-if="service.status == 4" class="error">No Registro</v-chip>
											<v-chip label small v-if="service.status == 5" color="orange darken-1">Repetido</v-chip>
										</v-flex>
									</v-layout>
								</v-expansion-panel-header>
								<v-expansion-panel-content>
									<v-layout row wrap>
										<v-flex xs4 sm4 md4 lg1 xl1>
											<small>Facturas</small><br>
											<ul class="list-style: none;" v-for="(bill, index) in service.bills" :key="index">
												<li @click="editFolio(bill.id)">{{bill.folio}}</li>
											</ul>
											<v-icon v-if="service.is_payed == 1 && (service.status < 3)" color="blue" @click="createBill(index, 'Factura')">add</v-icon>
										</v-flex>
										<v-flex xs4 sm4 md4 lg1 xl1>
											<small>Recibos</small><br>
											<ul class="list-style: none;" v-for="(receipt, index) in service.receipts" :key="index">
												<li @click="editFolio(bill.id)">{{receipt.folio}}</li>
											</ul>
											<v-icon v-if="service.is_payed == 1 && (service.status < 3)" color="blue" @click="createBill(index, 'Recibo')">add</v-icon>
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
											<v-btn dark fab small color="warning" title="Editar" @click="EditService(index)">
												<v-icon dark color="white">edit</v-icon>
											</v-btn>
											<v-btn dark fab small color="grey" title="Proceso" @click="CheckList(index)">
												<v-icon dark>list</v-icon>
											</v-btn>
											<v-btn dark fab small color="info" title="Comentarios" @click="showComments(index)">
												<v-icon dark>comment</v-icon>
											</v-btn>
											<v-btn dark fab small color="green" title="Comisiones" @click="showComissions(index)">
												<v-icon dark>attach_money</v-icon>
											</v-btn>
											<v-btn v-if="service.status > 1" dark fab small color="green" title="Activar" @click="ServiceChangeStatus(index, 'success')">
												<v-icon dark>check</v-icon>
											</v-btn>
											<v-btn v-else dark fab small color="error" title="Cancelar" @click="ServiceChangeStatus(index, 'error')">
												<v-icon dark>block</v-icon>
											</v-btn>
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
		<Services :service_dialog="1" ref="services_form" v-on:addService="newService($event)" v-on:updateService="updateService($event)"></Services>
		<Bills :billing_dialog="1" ref="bills_form" v-on:updateServices="Reload()"></Bills>
		<ServiceStatus ref="service_cancel" v-on:updateService="updateService($event)"></ServiceStatus>
		<Comments ref="comments_dialog"></Comments>
		<Comissions ref="comissions_dialog"></Comissions>
	</div>
</template>

<script>
import Customer from '@/components/Customer'
import Services from '@/components/Services'
import Bills from '@/components/Bills'
import Quotes from '@/components/Quotes'
import ServiceStatus from '@/components/ServiceStatus'
import Progress from '@/components/Progress'
import Comments from '@/components/Comments'
import Comissions from '@/components/Comissions'
import axios from 'axios'
export default {
	layout: 'admin',
	middleware: 'auth',
	head:{
        title: 'Control de Servicios'
	},
	components:{Customer, Services, Bills, Quotes, ServiceStatus, Progress, Comments, Comissions},

	data(){
		return{
			//Data
			services:[],
			services_loading:false,
			search_table:'',
			search_invoice:'',
			selected_service:'',
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
				{id:1, status:'Pendiente'},
				{id:2, status:'Pagado'}
			];
			this.payed_status = 1;

			this.statuses = [
				{id:'todo', status:'Todo'},
				{id:1, status:'Pendiente'},
				{id:2, status:'Terminado'},
				{id:3, status:'Cancelado'},
				{id:4, status:'No Registro'},
				{id:5, status:'Repetido'}
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

		addPackage(){
			this.$refs.services_form.addPackage();
		},

		addBill(){
			this.$refs.bills_form.addBill(1);
		},
		
		createBill(index, type){
			const bill = this.services[index];
			let customer_id = bill.customer_id;
			let customer = bill.customer;
			this.$refs.bills_form.addBillAlready(customer_id, customer, type, 1);
		},
		
		createReceipt(index, type){
			const receipt = this.services[index];
			let customer_id = receipt.customer_id;
			let customer = receipt.customer;
			this.$refs.bills_form.addBillAlready(customer_id, customer, type, 1);
		},

		editFolio(id){
			this.$refs.bills_form.editBill(id, 1);
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
		}, 

		EditService(index){
			const service = this.services[index];
			this.selected_service = index;
			let service_id = service.id;
			this.$refs.services_form.editService(service_id);
		},

		updateService(data){
			this.services[this.selected_service] = data;
			this.services.splice(this.selected_service, 1, data);
			this.selected_service = '';
		}, 

		ServiceChangeStatus(index, color){
			const service = this.services[index];
			this.selected_service = index;
			this.$refs.service_cancel.ServiceChangeStatus(service.id, color, service.status);
		},

		CheckList(index){
			this.selected_service = index;
			const service = this.services[index];
			this.$refs.process_form.openProgress(service.id);
			
		},

		updateProgress(data){
			this.services.splice(this.selected_service, 1, data);
		},

		showComments(index){
			const service = this.services[index];
			this.$refs.comments_dialog.showComments(service.id, '', 'service');
		},

		showComissions(index){
			const service = this.services[index];
			this.$refs.comissions_dialog.showComissions(service.id, 'service');
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