<template>
    <div>
		<v-dialog v-model="brands_dialog" fullscreen transition="dialog-bottom-transition" scrollable>
			<v-card>
				<v-card-title color="primary" style="background-color:#FF9800; color: white;" dark dense>
					Marcas
					<v-spacer></v-spacer>
					<v-btn icon dark @click="brands_dialog = false">
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</v-card-title>
				<v-card-text class="pb-4">
					<v-container fluid grid-list-xl>
						<v-layout wrap class="">
							<v-flex xs6 sm6 md3 lg3 xl3>
								<v-btn color="primary" dark @click="createBrand">
									<v-icon left>person_add</v-icon>
									Agregar marca
								</v-btn>
							</v-flex>
							<v-flex xs6 sm6 md3 lg3 xl3>
								<v-select label="Agregar marcas existentes" outlined color="primary"></v-select>
							</v-flex>
							<v-flex xs6 sm6 md3 lg3 xl3>
								<v-text-field class="text-right" outlined color="light-blue darken-2" prepend-icon="search" v-model="search_brands" @change="LoadBrands" label="Buscar marcas..." type="text" clearable></v-text-field>
							</v-flex>
							<v-flex xs6 sm6 md3 lg3 xl3 class="text-right">
								<v-btn icon class="ma-2 white--text" @click="LoadBrands">
									<v-icon>sync</v-icon>
								</v-btn>
							</v-flex>
						</v-layout>
						<v-layout wrap>
							<v-flex xs12>
								<v-card class="elevation-4" :loading="brands_loading">
									<v-simple-table class="elevation-1">
										<thead>
											<tr>
												<th class="text-left"></th>
												<th class="text-left">Marca</th>
												<th class="text-left">Registro</th>
												<th class="text-left">Declaración</th>
												<th class="text-left">Recordatorio</th>
												<th class="text-left">Vencimiento</th>
												<th class="text-left">Estatus</th>
												<th class="text-left">Creado</th>
												<th class="text-right"></th>
											</tr>
										</thead>
										<tbody>
											<tr v-for="(brand, index) in brands" :key="index">
												<td>
													<v-avatar :size="$vuetify.breakpoint.smAndUp ? 42 : 42">
														<v-img :src="brand.logo_url"></v-img>
													</v-avatar>
												</td>
												<td>{{ brand.brand }}</td>
												<td>{{ brand.registration_date }}</td>
												<td>{{ brand.date_declaration }}</td>
												<td>{{ brand.date_reminder }}</td>
												<td>{{ brand.date_expiration }}</td>
												<td>
													<div v-if="brand.status == 0">
														<v-chip color="red" dark>Inactivo</v-chip>
													</div>
													<div v-if="brand.status == 1">
														<v-chip color="green" dark>Activo</v-chip>
													</div>
												</td>
												<td>{{ brand.created_at }}</td>
												<td class="text-right">
													<v-icon color="grey">list</v-icon>
													<v-icon color="warning">edit</v-icon>
													<v-icon color="red">delete</v-icon>
												</td>
											</tr>
										</tbody>
									</v-simple-table>
								</v-card>
							</v-flex>
						</v-layout>
					</v-container>
				</v-card-text>
				<v-card-actions
					style="background-color:rgba(0,0,0,0.1); color: white; position:absolute; bottom: 0; width:100%;"
					>
					<v-spacer></v-spacer>
					<v-btn color="grey" @click="brands_dialog = false" dark>Cerrar</v-btn>
				</v-card-actions>
				<div style="flex: 1 1 auto;"></div>
			</v-card>
		</v-dialog>
		<v-dialog v-model="brand_dialog" max-width="600" height="auto" style="overflow: auto;">
			<v-form @submit.prevent="Save">
				<v-card>
					<v-card-title class="primary white--text">
						{{ dialog_title }}
						<v-spacer></v-spacer>
						<v-btn icon @click="brand_dialog = false"><v-icon>close</v-icon></v-btn>
					</v-card-title>
					<v-card-text>
						<v-container>
							<v-row>
								<v-col cols="12" sm="12" md="12" lg="12">
									<v-text-field label="Marca o slogan" outlined v-model="brand" append-icon="copyright" autofocus :error-messages="errors.brand"></v-text-field>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="12" sm="12" md="12">
									<v-textarea outlined label="Descripción" v-model="description" rows="4" auto-grow></v-textarea>
								</v-col>
							</v-row>
						</v-container>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn text @click="brand_dialog = false">Cerrar</v-btn>
						<v-btn class="primary" type="submit" :loading="loading">Guardar <v-icon right>save</v-icon></v-btn>
					</v-card-actions>
				</v-card>
			</v-form>
		</v-dialog>
	</div>
</template>

<script>
import axios from "axios";
export default {
	props: ["customer"],
    data(){
        return {
            //brands
            brands_dialog: false,
            brands: [],
            brands_loading: false,
			customer_id: '',
			search_brands:'',
			//Contact form
			errors:[],
			brand_dialog: false,
			dialog_title:'',
            loading: false,
            brand_id: '',
            brand: '',
			description:''
        };
    },

    methods:
    {
        //Contacts
        openBrands(customer_id)
        {
            this.brands_dialog = true;
            this.customer_id = customer_id;
			this.LoadBrands(customer_id);
        },

        async LoadBrands(customer_id)
        {
            this.brands_loading = true;
            await this.$axios
                .post('/api/customer/brands', {id:customer_id, search:this.search_brands})
                .then(res =>
                {
                    this.brands = res.data.data;
                    this.brands_loading = false;
                })
                .catch(error =>
                {
                    console.log(error);
                    this.brands_loading = false;
                });
        },

        clearBrandForm()
        {
			this.brand_id = '';
			this.brand = '';
			this.description ='';
			this.errors = {};
        },

        createBrand()
        {
			if (this.customer_id == ''){
				this.brands_dialog = false;
			}
			else{
				this.brand_dialog = true;
				this.dialog_title = 'Crear marca';
				this.clearBrandForm();
			}
		},
		
		async Save(){
			this.loading = true;
			//Update
			if(this.brand_id){

			}
			//Store
			else{
				await this.$axios.post('/api/customer/brand', {brand:this.brand, description:this.description, customer_id:this.customer_id})
				.then(res => {
					this.loading = false;
					this.brands.unshift(res.data);
					this.clearBrandForm();
					this.brand_dialog = false;
				})
				.catch(error => {
					this.loading = false;
					this.errors = error.response.data.errors;
				})
			}
			
		}
    },
};
</script>

<style>
</style>
