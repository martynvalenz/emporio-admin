<template>
    <div>
        <h2>Categorías de servicios</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="loading_table">
					<v-card-title>
						<v-btn color="primary" class="mx-1">Agregar Categoría<v-icon right>add</v-icon></v-btn>
						<v-spacer></v-spacer>
						<v-btn icon @click="loadCategories"><v-icon>sync</v-icon></v-btn>
					</v-card-title>
					<v-divider></v-divider>
					<v-card-text>
						<v-simple-table class="elevation-1">
							<thead>
								<tr>
									<th class="text-left">Clave</th>
									<th class="text-left">Categoría</th>
									<th class="text-center">Servicios</th>
									<th class="text-left">Estatus</th>
									<th class="text-left">Agregada</th>
									<th class="text-right"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(reg, index) in categories" :key="index">
									<td>{{ reg.key }}</td>
									<td>{{ reg.binnacle_status }}</td>
									<td class="text-center">{{ reg.services }}</td>
									<td>
										<v-chip v-if="reg.status" color="green" dark>Activo</v-chip>
										<v-chip v-else dark color="red">Inactivo</v-chip>
									</td>
									<td>{{ reg.created_at }}</td>
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
        title: 'Categorías'
	},
    data(){
        return{
            //Data
            categories:[],
            loading_table:false,
        }
    },

    created(){
        this.loadCategories();
    },

    methods:{
        async loadCategories(){
            this.loading_table = true;
            await this.$axios('/api/categories')
            .then(res => {
                this.categories = res.data;
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