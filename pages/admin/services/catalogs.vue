<template>
    <div>
        <h2>Catálogo de servicios</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="loading_table">
					<v-card-title>
						<v-btn color="primary" class="mx-1" @click="addService">Agregar Servicio<v-icon right>add</v-icon></v-btn>
						<v-btn color="success" class="mx-1" to="/admin/services/comissions" router exact>Ver comisiones<v-icon right>money</v-icon></v-btn>
						<v-spacer></v-spacer>
						<v-btn icon @click="Reload"><v-icon>sync</v-icon></v-btn>
					</v-card-title>
                    <v-card-title>
						<v-layout>
							<v-flex xs12 sm12 md4>
								<v-text-field  outlined color="light-blue darken-2" prepend-icon="search" v-model="search_table" v-on:keyup.enter="Reload" @click:clear="clearSearch" label="Buscar" type="text" clearable></v-text-field>
							</v-flex>
						</v-layout>
					</v-card-title>
					<v-divider></v-divider>
					<v-card-text>
						<v-simple-table class="elevation-1" fixed-header height="650px"> 
							<thead>
								<tr>
									<th class="text-left" style="width:10%">Clave</th>
									<th class="text-left" style="width:28%">Servicio</th>
									<th class="text-left" style="width:20%">Bitácora</th>
									<th class="text-center" style="width:5%">Moneda</th>
									<th class="text-center" style="width:12%">Precio</th>
									<th class="text-center" style="width:5%">Servicios</th>
									<th class="text-center" style="width:10%">Status</th>
									<th class="text-right" style="width:10%"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(reg, index) in services" :key="index">
									<td>{{ reg.code }}</td>
									<td>{{ reg.service }}</td>
									<td>{{ reg.binnacle }}</td>
									<td class="text-center">{{ reg.money_code }}</td>
									<td class="text-right">{{ formatPrice(reg.price) }}</td>
									<td class="text-center">{{ reg.services }}</td>
									<td class="text-center">
										<v-chip v-if="reg.status == 1" color="green" dark>Activo</v-chip>
										<v-chip v-else dark color="red">Inactivo</v-chip>
									</td>
									<td class="text-right">
										<v-menu offset-y class="text-center">
											<template v-slot:activator="{on}">
												<v-btn v-on="on">
													<span>
														<v-badge color="primary" overlap v-if="reg.requisites > 0">
															<template v-slot:badge>
																<span>{{reg.requisites}}</span>
															</template>
															<v-icon color="warning">list</v-icon>
														</v-badge>
														<v-badge color="error" overlap v-if="reg.requisites == 0">
															<template v-slot:badge >
																<span>{{reg.requisites}}</span>
															</template>
															<v-icon color="warning">list</v-icon>
														</v-badge>
													</span>
												</v-btn>
											</template>
											<v-list>
												<v-list-item  @click="openProcess(index)">
													<v-list-item-content>
														<v-list-item-title>Check List</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="warning">list</v-icon>
													</v-list-item-action>
												</v-list-item>
												<v-list-item @click="editService(index)">
													<v-list-item-content>
														<v-list-item-title>Editar</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="warning">edit</v-icon>
													</v-list-item-action>
												</v-list-item>
												<v-list-item v-if="reg.status == 1" @click="editStatus(index, reg.status)">
													<v-list-item-content>
														<v-list-item-title>Cancelar</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="error">block</v-icon>
													</v-list-item-action>
												</v-list-item>
												<v-list-item v-else @click="editStatus(index, reg.status)">
													<v-list-item-content>
														<v-list-item-title>Cancelar</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="green">check</v-icon>
													</v-list-item-action>
												</v-list-item>
											</v-list>
										</v-menu>
									</td>
								</tr>
								<tr>
									<td style="width:100%" colspan="8">
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

		<Catalog :service_dialog="1" ref="services_form" v-on:newService="newService($event)" v-on:updateService="updateService($event)"></Catalog>
		<Process ref="process_form" v-on:updateProcess="updateProcess($event)"></Process>

		<v-dialog v-model="status_dialog" width="400">
			<v-form>
				<v-card>
					<v-card-title>
						{{title}}
						<v-spacer></v-spacer>
						<v-btn icon @click="status_dialog = false"><v-icon>close</v-icon></v-btn>
					</v-card-title>
					<v-card-text>
						<div v-if="service_status">¿Quieres inactivar el servicio? Ya no aparecerá como opción seleccionable en servicios nuevos.</div>
						<div v-else>¿Quieres activar el servicio?</div>
					</v-card-text>
					<br>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn text @click="status_dialog = false">Cerrar</v-btn>
						<v-btn v-if="service_status == 1" @click="changeStatus()" class="error" :loading="loading">Desactivar <v-icon right>block</v-icon></v-btn>
						<v-btn v-else class="success" @click="changeStatus()" :loading="loading">Activar<v-icon right>check</v-icon></v-btn>
					</v-card-actions>
				</v-card>
			</v-form>
		</v-dialog>
    </div>
</template>

<script>
import axios from 'axios'
import Catalog from '@/components/Catalog'
import Process from '@/components/Process'
export default {
    layout: 'admin',
	middleware: 'auth',
	head:{
        title: 'Catálogo de servicios'
	},
	components:{Catalog, Process},
    data(){
        return{
            //Data
            services:[],
			loading_table:false,
			loading:false,
			search_table:'',
			page:1,
			title:'',
			catalog_selected:'',
			services_catalog_id:'',
			status_dialog:false,
			service_status:'',
			//snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
			timeout: 6000,
        }
    },
	
	computed: {
		url(){
			return `${process.env.api}/api/catalogs?page=${this.page}`
		}
	},

	created(){
        this.Load();
	},

    methods:{
        async Load(){
			this.loading_table = true;
			await this.$axios.post(this.url, {search:this.search_table})
			.then(res => {
				this.services = res.data.data;
				this.loading_table = false;
			})
			.catch(error => {
				this.loading_table = false;
			})
		},

		infiniteScroll($state){
			setTimeout(() => {
				this.page++
				this.$axios.post(this.url, {search:this.search_table})
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

		addService(){
			this.$refs.services_form.addService();
		},

		editService(index){
			const service = this.services[index];
			this.catalog_selected = index;
			var service_id = service.id;
			this.$refs.services_form.editService(service_id);
		},

		openProcess(index){
			const service = this.services[index];
			var service_id = service.id;
			this.catalog_selected = index;
			this.$refs.process_form.openProcess(service_id)
		},

		newService(data){
			this.services.unshift(data);
		},

		updateService(data){
			// this.services[this.catalog_selected] = data;
			this.services.splice(this.catalog_selected,1,data);
			this.catalog_selected = '';
		},

		editStatus(index, value){
			const service = this.services[index];
			this.catalog_selected = index;
			this.services_catalog_id = service.id;
			this.service_status = value;
			this.status_dialog = true;
			if(value == 1){
				this.title = 'Desactivar registro';
			}
			else if(value == 0){
				this.title = 'Activar registro';
			}
		},

		async changeStatus(){
			this.loading = true;
			await this.$axios.put(`/api/catalog/status/${this.services_catalog_id}`, {status:this.service_status})
			.then(res => {
				this.services[this.catalog_selected] = res.data;
				this.snackbar = true;
				this.snackColor = 'info';
				this.snackText = 'Se cambió el estatus del servicio';
				this.timeout = 1500;
				this.catalog_selected = '';
				this.services_catalog_id = '';
				this.service_status = '';
				this.loading = false;
				this.status_dialog = false;
			})
			.catch(error => {
				this.snackbar = true;
				this.snackColor = 'error';
				this.snackText = 'No se pudo cambiar el estatus, inténtelo de nuevo o refresque la página.';
				this.timeout = 1500;
				this.loading = false;
				this.status_dialog = false
			})
		}, 

		updateProcess(data){
			this.services[this.catalog_selected].requisites = data;
			// this.catalog_selected = '';
		}
    } 
}
</script>
