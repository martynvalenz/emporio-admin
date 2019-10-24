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
							<v-flex xs6 sm6 md6 lg2 xl2>
								<v-btn color="primary" dark @click="createBrand">
									<v-icon left>add</v-icon>
									Agregar marca
								</v-btn>
							</v-flex>
							<v-flex xs6 sm6 md6 lg4 xl4>
								<v-autocomplete v-model="search_brand" :items="search_items" outlined :loading="searchLoading" :search-input.sync="search" hide-no-data hide-selected item-text="brand" item-value="id" placeholder="Agregar marcas existentes..." prepend-icon="copyright" return-object clearable :error-messages="errors.brand_id">
									<template v-if="known_brand" v-slot:append-outer>
										<v-slide-x-reverse-transition mode="out-in">
											<v-btn fab small color="success"  @click="addKnownBrand" :loading="searchLoading">
												<v-icon color="white">add</v-icon>
											</v-btn>
										</v-slide-x-reverse-transition>
									</template>
								</v-autocomplete>
							</v-flex>
							<v-flex xs6 sm6 md6 lg3 xl3>
								<v-text-field class="text-right" outlined color="light-blue darken-2" prepend-icon="search" v-model="search_brands" @change="Reload" @click:clear="clearSearch" label="Buscar marcas..." type="text" clearable></v-text-field>
							</v-flex>
							<v-flex xs6 sm6 md6 lg3 xl3 class="text-right">
								<v-btn icon class="ma-2 white--text" @click="Reload">
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
														<v-img :src="brand.logo_url" @click="changeLogo(index)"></v-img>
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
													<v-icon color="warning" @click="edit(index)">edit</v-icon>
													<v-icon color="red" @click="deleteBrand(index)">delete</v-icon>
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
		<v-dialog v-model="logo_dialog" max-width="450" height="auto" style="overflow: auto;">
			<v-form @submit.prevent="Save">
				<v-card>
					<v-card-title class="primary white--text">
						Cambiar Logo
						<v-spacer></v-spacer>
						<v-btn icon @click="logo_dialog = false"><v-icon>close</v-icon></v-btn>
					</v-card-title>
					<v-card-text>
						<v-hover 
                            v-slot:default="{ hover }"
                            open-delay="0"
                            close-delay="3"
                            >
                            <v-avatar
                                :size="$vuetify.breakpoint.smAndUp ? 200 : 200"
                                color="grey" 
                                style="border: 1px solid grey;"
								tile
                                >
                                <v-img :src="logo">
                                    <v-layout justify-center align-center>
                                        <v-expand-transition>
                                            <div v-if="!selectedFile">
                                                <v-btn v-if="hover" fab color="primary" @click="pickFile"><v-icon>image</v-icon></v-btn>
                                            </div>
                                        </v-expand-transition>
                                        <div v-if="selectedFile">
                                            <v-btn fab :loading="loading_avatar" color="success" @click="UploadImage"><v-icon>save</v-icon></v-btn>
                                            <v-btn fab color="grey" @click="CancelImage"><v-icon>close</v-icon></v-btn>
                                        </div>
                                    </v-layout>
                                </v-img>
                            </v-avatar>
                        </v-hover>
                        <input ref="fileSelected" @change="onFileSelected" type="file" style="display:none;" accept="image/*" />
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn text @click="logo_dialog = false">Cerrar</v-btn>
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
			page:1,
			//Known brands
			search:false,
			search_brand:'',
			search_items:[],
			searchLoading:false,
			known_brand:'',
			//Contact form
			errors:[],
			brand_dialog: false,
			dialog_title:'',
            loading: false,
            brand_id: '',
            brand: '',
			description:'',
			selected_brand:'',
			//Logo
			logo_dialog:false,
			logo:'',
			selectedFile:'',
			selected_logo:''
        };
	},
	
	watch: {
		search(val){
			val && val !== this.search_brand && this.brandSelect(val)
		}
	},

	computed: {
		url(){
			return `${process.env.api}/api/customer/brands?page=${this.page}`
		}
	},

    methods:
    {
        //Contacts
        openBrands(customer_id)
        {
			this.brands_dialog = true;
			this.search_brands = '';
			this.search_items = [];
			this.customer_id = customer_id;
			this.$refs.infiniteLoading.stateChanger.reset();
			this.Load(customer_id);
			console.clear();
        },

        async Load(customer_id)
        {
            this.brands_loading = true;
            await this.$axios.post(this.url, {id:customer_id, search:this.search_brands})
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

		infiniteScroll($state){
			setTimeout(() => {
				this.page++
				this.$axios.post(this.url, {id:customer_id, search:this.search_brands})
				.then( res => {

					let brands = res.data.data;

					if(brands.length > 0){
						this.brands = this.brands.concat(brands);
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
			this.search_brands = '';
			this.brands = {};
			this.page = 1;
			this.$refs.infiniteLoading.stateChanger.reset();
			this.Load(this.customer);
		},

		Reload(){
			this.brands = {};
			this.page = 1;
			this.$refs.infiniteLoading.stateChanger.reset();
			this.Load(this.customer);
		},
		
		async brandSelect(val){
			this.searchLoading = true;
			if(val){
				await this.$axios.post('/api/customer/brand-list', {customer_id:this.customer, search:val})
				.then(res => {
					this.search_items = res.data;
					this.known_brand = this.search_brand.id;
					this.searchLoading = false;
				})
				.catch(error => {
					console.log(error);
					this.searchLoading = false;
				})
			}
			else{
				this.search_items = {};
				this.seach_brand = '';
			}
		},

		async addKnownBrand(){
			this.searchLoading = true;
			await this.$axios.post('/api/customer/add-brand', {customer_id:this.customer, brand_id:this.known_brand})
			.then(res => {
				this.searchLoading = false;
				this.brands.unshift(res.data);
				this.known_brand = '';
				this.search_items = {};
				this.search_brand = null;
			})
			.catch(error => {
				this.searchLoading = false;
				this.errors = error.response.data.errors;
			})
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

		edit(index){
			this.brand_dialog = true;
			const brand = this.brands[index];
			this.selected_brand = index;
			this.dialog_title = 'Editar marca';
			this.brand_id = brand.id;
			this.brand = brand.brand;
			this.description = brand.description;
			this.errors = {};
		},
		
		async Save(){
			this.loading = true;
			//Update
			if(this.brand_id){
				await this.$axios.put(`/api/customer/brand/${this.brand_id}`, {brand:this.brand, description:this.description})
				.then(res => {
					this.loading = false;
					this.brands[this.selected_brand] = res.data;
					this.brand_dialog = false;
					this.clearBrandForm();
				})
				.catch(error => {
					this.loading = false;
					this.errors = error.response.data.errors;
				})
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
			
		},

		deleteBrand(index){
			const brand_to_delete = this.brands[index];
			this.$axios.post('/api/customer/brand-delete', {customer_id:this.customer, brand_id:brand_to_delete.id})
			.then(res => {
				this.brands.splice(index, 1);
			})
			.catch(error => {
				console.log(error)
			})
		},

		changeLogo(index){
			this.logo_dialog = true;
			const logo = this.logo[index];
			this.selected_logo = index;
			this.brand_id = logo.id;
			this.logo = logo.logo_url;
			this.errors = {};
		},

		pickFile(){
			this.$refs.fileSelected.click();
		},

		onFileSelected(event){
			const files = event.target.files;
            this.selectedFile = event.target.files[0];
            let filename = files[0].name;
            let size = files[0].size; 

            if(!filename){
                this.selectedFile = null;
                return;
            }

            if(size > 2000000){
                alert( 'Archivo demasiado pesado. El límite es de 2mb.');
                return;
            }

            const fileReader = new FileReader();
            fileReader.addEventListener('load', () => {
                this.logo = fileReader.result;
            })
            fileReader.readAsDataURL(files[0]);
		},
    },
};
</script>

<style>
</style>
