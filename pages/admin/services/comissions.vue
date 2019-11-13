<template>
    <div>
        <h2>Catálogo de comisiones</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="loading_table">
					<v-card-title>
						<v-btn color="primary" class="mx-1">Agregar Servicio<v-icon right>add</v-icon></v-btn>
						<v-btn color="info" class="mx-1" to="/admin/services/catalogs" router exact>Ver catálogo<v-icon right>chrome_reader_mode</v-icon></v-btn>
						<v-spacer></v-spacer>
						<v-btn icon @click="Load"><v-icon>sync</v-icon></v-btn>
					</v-card-title>
                    <v-card-title>
						<v-layout>
							<v-flex xs12 sm12 md4>
								<v-text-field  outlined color="light-blue darken-2" prepend-icon="search" v-model="search_table" v-on:keyup.enter="Load" @click:clear="Reload()" label="Buscar" type="text" clearable></v-text-field>
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
									<th class="text-center" style="width:5%">Moneda</th>
									<th class="text-center" style="width:15%">Precio</th>
									<th class="text-center" style="width:6%">Venta</th>
									<th class="text-center" style="width:6%">Operativa</th>
									<th class="text-center" style="width:6%">Gestión</th>
									<th class="text-center" style="width:7%">Status</th>
									<th class="text-right" style="width:10%"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(reg, index) in comissions" :key="index">
									<td>{{ reg.code }}</td>
									<td>{{ reg.service }}</td>
									<td class="text-center">{{ reg.money_code }}</td>
									<td class="text-right">{{ formatPrice(reg.price) }}</td>
									<td class="text-right" v-if="reg.sales == 0" :title="Math.round(reg.sales_comission_ammount)"><b class="red--text">%</b>{{ formatPrice(reg.sales_comission) }}</td>
									<td class="text-right" v-else><b class="green--text">$</b>{{ formatPrice(reg.sales_comission) }}</td>
									<td class="text-right" v-if="reg.management == 0" :title="Math.round(reg.management_comission_ammount)"><b class="red--text">%</b>{{ formatPrice(reg.management_comission) }}</td>
									<td class="text-right" v-else><b class="green--text">$</b>{{ formatPrice(reg.management_comission) }}</td>
									<td class="text-right" v-if="reg.operations == 0" :title="Math.round(reg.operations_comission_ammount)"><b class="red--text">%</b>{{ formatPrice(reg.operations_comission) }}</td>
									<td class="text-right" v-else><b class="green--text">$</b>{{ formatPrice(reg.operations_comission) }}</td>
									<td class="text-center">
										<v-chip v-if="reg.status" color="green" dark>Activo</v-chip>
										<v-chip v-else dark color="red">Inactivo</v-chip>
									</td>
									<td class="text-right">
										<v-icon color="warning">edit</v-icon>
										<v-icon color="error" v-if="reg.status = 1">block</v-icon>
										<v-icon color="success" v-else>check</v-icon>
									</td>
								</tr>
							</tbody>
						</v-simple-table>
						<!-- <v-data-table :headers="headers"  sort-by="customer" class="elevation-4">

						</v-data-table> -->
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
        title: 'Catálogo de comisiones'
	},
    data(){
        return{
            //Data
            comissions:[],
            loading_table:false,
            search_table:''
        }
    },

    created(){
        this.Load();
    },

    methods:{
        async Load(){
            this.loading_table = true;
            await this.$axios.post('/api/catalogs/comissions', {search:this.search_table})
            .then(res => {
                this.comissions = res.data;
                this.loading_table = false;
            })
            .catch(error => {
                this.loading_table = false;
                console.log(error)
            })
		},

		Reload(){
			this.search_table = '';
			this.Load();
		},
		
		formatPrice(value) {
			let val = (value/1).toFixed(2).replace('.,', '.')
			return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},

		showTotal(){
			alert('total');
		}
    } 
}
</script>