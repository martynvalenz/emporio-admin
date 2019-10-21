<template>
    <div>
        <h2>Catálogo de servicios</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="loading_table">
					<v-card-title>
						<v-btn color="primary" class="mx-1">Agregar Servicio<v-icon right>add</v-icon></v-btn>
						<v-spacer></v-spacer>
						<v-btn icon @click="Load"><v-icon>sync</v-icon></v-btn>
					</v-card-title>
                    <v-card-title>
						<v-layout>
							<v-flex xs12 sm12 md4>
								<v-text-field  outlined color="light-blue darken-2" prepend-icon="search" v-model="search_table" @change="Load" label="Buscar" type="text" clearable></v-text-field>
							</v-flex>
						</v-layout>
					</v-card-title>
					<v-divider></v-divider>
					<v-card-text>
						<v-simple-table class="elevation-1">
							<thead>
								<tr>
									<th class="text-left">Clave</th>
									<th class="text-left">Servicio</th>
									<th class="text-left">Categoría</th>
									<th class="text-left">Bitácora</th>
									<th class="text-left">Moneda</th>
									<th class="text-left">Precio</th>
									<th class="text-left">Status</th>
									<th class="text-right"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(reg, index) in services" :key="index">
									<td>{{ reg.code }}</td>
									<td>{{ reg.service }}</td>
									<td>{{ reg.category }}</td>
									<td>{{ reg.binnacle }}</td>
									<td>{{ reg.money_code }}</td>
									<td>{{ reg.price }}</td>
									<td>
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
        title: 'Catálogo de servicios'
	},
    data(){
        return{
            //Data
            services:[],
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
            await this.$axios.post('/api/catalogs', {search:this.search_table})
            .then(res => {
                this.services = res.data;
                this.loading_table = false;
            })
            .catch(error => {
                this.loading_table = false;
                console.log(error)
            })
        }
    } 
}
</script>