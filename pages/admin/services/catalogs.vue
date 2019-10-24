<template>
    <div>
        <h2>Catálogo de servicios</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="loading_table">
					<v-card-title>
						<v-btn color="primary" class="mx-1">Agregar Servicio<v-icon right>add</v-icon></v-btn>
						<v-btn color="success" class="mx-1" to="/admin/services/comissions" router exact>Ver comisiones<v-icon right>money</v-icon></v-btn>
						<v-spacer></v-spacer>
						<v-btn icon @click="Reload"><v-icon>sync</v-icon></v-btn>
					</v-card-title>
                    <v-card-title>
						<v-layout>
							<v-flex xs12 sm12 md4>
								<v-text-field  outlined color="light-blue darken-2" prepend-icon="search" v-model="search_table" @change="Reload" @click:clear="clearSearch" label="Buscar" type="text" clearable></v-text-field>
							</v-flex>
						</v-layout>
					</v-card-title>
					<v-divider></v-divider>
					<v-card-text>
						<v-simple-table class="elevation-1" fixed-header height="500px"> 
							<thead>
								<tr>
									<th class="text-left" style="width:10%">Clave</th>
									<th class="text-left" style="width:25%">Servicio</th>
									<th class="text-left" style="width:20%">Bitácora</th>
									<th class="text-center" style="width:5%">Moneda</th>
									<th class="text-center" style="width:12%">Precio</th>
									<th class="text-center" style="width:5%">Servicios</th>
									<th class="text-center" style="width:10%">Status</th>
									<th class="text-right" style="width:13%"></th>
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
										<v-chip v-if="reg.status" color="green" dark>Activo</v-chip>
										<v-chip v-else dark color="red">Inactivo</v-chip>
									</td>
									<td class="text-right">
										<v-icon color="warning">list</v-icon>
										<v-icon color="warning">edit</v-icon>
										<v-icon color="error" v-if="reg.status = 1">block</v-icon>
										<v-icon color="success" v-else>check</v-icon>
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
    </div>
</template>

<script>
import axios from 'axios'
export default {
    layout: 'admin',
	middleware: 'auth',
	head:{
        title: 'Catálogo de servicios'
	},
    data(){
        return{
            //Data
            services:[],
            loading_table:false,
			search_table:'',
			page:1
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
		}
    } 
}
</script>
