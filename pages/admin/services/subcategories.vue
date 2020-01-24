<template>
    <div>
        <h2>Subcategorías de servicios</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="loading_table">
					<v-card-title>
						<v-btn color="primary" class="mx-1" @click="newSubcategory">Agregar Subcategoría<v-icon right>add</v-icon></v-btn>
						<v-spacer></v-spacer>
						<v-btn icon @click="loadSubcategories"><v-icon>sync</v-icon></v-btn>
					</v-card-title>
					<v-divider></v-divider>
					<v-card-text>
						<v-simple-table class="elevation-1">
							<thead>
								<tr>
									<th class="text-left" style="width:17%">Subcategoría</th>
									<th class="text-left" style="width:15%">Bitácora</th>
									<th class="text-left" style="width:10%">Renovación</th>
									<th class="text-left" style="width:10%">Declaración</th>
									<th class="text-left" style="width:10%">Recordatorio</th>
									<th class="text-left" style="width:10%">Vencimiento</th>
									<th class="text-center" style="width:10%">Registros</th>
									<th class="text-center" style="width:10%">Estatus</th>
									<th class="text-right" style="width:8%"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(reg, index) in subcategories" :key="index">
									<td>{{ reg.subcategory }}</td>
									<td>{{ reg.binnacle_status }}</td>
									<td class="text-center">
										<v-chip v-if="reg.renovation" color="green" dark>Si</v-chip>
										<v-chip v-else dark color="red">No</v-chip>
									</td>
									<td>
										<span v-if="reg.declaration_use == 0" class="grey--text">N/A</span>
										<span v-if="reg.declaration_use > 0 && reg.declaration_use <= 30">{{ Math.round(reg.declaration_use) }} día/s</span>
										<span v-if="reg.declaration_use > 30 && reg.declaration_use <= 365">{{ Math.round(reg.declaration_use / 30.4) }} mes/es</span>
										<span v-if="reg.declaration_use > 365">{{ Math.round(reg.declaration_use / 365.25) }} año/s</span>
									</td>
									<td>
										<span v-if="reg.reminder == 0" class="grey--text">N/A</span>
										<span v-if="reg.reminder > 0 && reg.reminder <= 30">{{ Math.round(reg.reminder) }} día/s</span>
										<span v-if="reg.reminder > 30 && reg.reminder <= 365">{{ Math.round(reg.reminder / 30.4) }} mes/es</span>
										<span v-if="reg.reminder > 365">{{ Math.round(reg.reminder / 365.25) }} año/s</span>
									</td>
									<td>
										<span v-if="reg.expiration == 0" class="grey--text">N/A</span>
										<span v-if="reg.expiration > 0 && reg.expiration <= 30">{{ Math.round(reg.expiration) }} día/s</span>
										<span v-if="reg.expiration > 30 && reg.expiration <= 365">{{ Math.round(reg.expiration / 30.4) }} mes/es</span>
										<span v-if="reg.expiration > 365">{{ Math.round(reg.expiration / 365.25) }} año/s</span>
									</td>
									<td class="text-center">{{ reg.registries }}</td>
									<td class="text-center">
										<v-chip v-if="reg.status" color="green" dark>Activo</v-chip>
										<v-chip v-else dark color="red">Inactivo</v-chip>
									</td>
									<td class="text-right">
										<v-icon color="warning" @click="edit(index)">edit</v-icon>
										<v-icon color="error" v-if="reg.status = 1">block</v-icon>
										<v-icon color="success" v-else>check</v-icon>
									</td>
								</tr>
							</tbody>
						</v-simple-table>
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>
		<v-dialog v-model="subcat_dialog" max-width="750" height="auto" style="overflow: auto;">
			<v-form>
				<v-card>
					<v-system-bar color="primary" dark height="60px;">
                        <h2>Subcategoría</h2>
                        <v-spacer></v-spacer>
                        <v-btn icon small @click="subcat_dialog = false"><v-icon color="white">close</v-icon></v-btn>
                    </v-system-bar>
					<v-card-text>
						<v-container>
							<v-row>
								<v-col cols="12" xs="12" sm="12" md="6" lg="6">
									<v-text-field label="Subcategoría *" outlined v-model="subcategory" autofocus :error-messages="errors.subcategory"></v-text-field>
								</v-col>
								<v-col cols="12" xs="12" sm="12" md="6" lg="6">
									<v-select v-model="status_category_id" outlined item-value="id" item-text="category" :items="statuses" label="Seleccionar Estatus" :error-messages="errors.status_category_id"></v-select>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="12" xs="6" sm="6" md="6" lg="3" xl="3">
									<v-select v-model="declaration_use_select" :items="periods" item-value="value" item-text="period" outlined label="Declaración de uso"></v-select>
								</v-col>
								<v-col cols="12" xs="6" sm="6" md="6" lg="3" xl="3">
									<v-text-field v-model="declaration_use" outlined type="number" step="any" min="0" label="Declaración de uso"></v-text-field>
								</v-col>
								<v-col cols="12" xs="6" sm="6" md="6" lg="3" xl="3">
									<v-select v-model="reminder_select" :items="periods" item-value="value" item-text="period" outlined label="Recordatorio"></v-select>
								</v-col>
								<v-col cols="12" xs="6" sm="6" md="6" lg="3" xl="3">
									<v-text-field v-model="reminder" outlined type="number" step="any" min="0" label="Recordatorio"></v-text-field>
								</v-col>
								<v-col cols="12" xs="6" sm="6" md="6" lg="3" xl="3">
									<v-select v-model="expiration_select" :items="periods" item-value="value" item-text="period" outlined label="Vencimiento"></v-select>
								</v-col>
								<v-col cols="12" xs="6" sm="6" md="6" lg="3" xl="3">
									<v-text-field v-model="expiration" outlined type="number" step="any" min="0" label="Vencimiento"></v-text-field>
								</v-col>
								<v-col cols="12" xs="6" sm="6" md="6" lg="3" xl="3">
									<v-checkbox v-model="renovation" color="primary" false-value="0" true-value="1" label="Renovación"></v-checkbox>
								</v-col>
							</v-row>
						</v-container>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn text @click="subcat_dialog = false">Cerrar</v-btn>
						<v-btn class="primary" @click="Save" :loading="loading">Guardar <v-icon right>save</v-icon></v-btn>
					</v-card-actions>
				</v-card>
			</v-form>
		</v-dialog>
		<v-snackbar
            v-model="snackbar"
            :timeout="timeout"
            top
            center
            :color="snackColor"
            >
            {{ snackText }}
        </v-snackbar>
    </div>
</template>

<script>
import axios from 'axios'
export default {
   layout: 'admin',
	middleware: 'auth',
	head:{
        title: 'Subcategorías'
	},
    data(){
        return{
			subcat_dialog:false,
			//Data
			subcategory_id:'',
			selected_subcategory:'',
			subcategory:'',
			statuses:[],
			status_category_id:'',
			declaration_use_select:'',
			declaration_use:0,
			expiration_select:'',
			expiration:0,
			reminder_select:'',
			reminder:0,
			renovation:1,
			periods:[
				{value:1, period:'Días'},
				{value:2, period:'Meses'},
				{value:3, period:'Años'}
			],
			//View
			loading:false,
            subcategories:[],
			loading_table:false,
			errors:[],
			//snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
			timeout: 6000,
        }
    },

    created(){
        this.loadSubcategories();
    },

    methods:{
        async loadSubcategories(){
            this.loading_table = true;
            await this.$axios('/api/subcategories')
            .then(res => {
                this.subcategories = res.data;
                this.loading_table = false;
            })
            .catch(error => {
                this.loading_table = false;
                console.log(error)
            })
		},

		
		newSubcategory(){
			this.subcat_dialog = true;
			this.getCategories();
			this.clearData();
		},

		getCategories(){
			this.$axios.get('/api/get-categories')
			.then(res => {
				this.statuses = res.data;
			})
		},

		clearData(){
			this.subcategory_id = '';
			this.subcategory = '';
			this.selected_subcategory = '';
			this.status_category_id = '';
			this.declaration_use_select = '';
			this.declaration_use = 0;
			this.reminder_select = '';
			this.reminder = 0;
			this.expiration_select = '';
			this.expiration = 0;
			this.renovation = 1;
		},

		async edit(index){
			this.subcat_dialog = true;
			this.getCategories();
			this.selected_subcategory = index;
			let id = this.subcategories[index].id;
			await this.$axios.get(`/api/subcategory/edit/${id}`)
			.then(res => {
				this.subcategory_id = res.data.id;
				this.subcategory = res.data.subcategory;
				this.renovation = res.data.renovation * 1;
				if(res.data.expiration > 0){
					if(res.data.expiration <= 30){
						this.expiration_select = 1;
						this.expiration = Math.round(res.data.expiration);
					}
					else if(res.data.expiration > 30 && res.data.expiration <= 365){
						this.expiration = Math.round(res.data.expiration / 30.4);
						this.expiration_select = 2;
					}
					else if(res.data.expiration > 365){
						this.expiration = Math.round(res.data.expiration / 365.25);
						this.expiration_select = 3;
					}
				}
				else{
					this.expiration_select = '';
					this.expiration = 0;
				}

				if(res.data.reminder > 0){
					if(res.data.reminder <= 30){
						this.reminder = Math.round(res.data.reminder);
						this.reminder_select = 1;
					}
					else if(res.data.reminder > 30 && res.data.reminder <= 365){
						this.reminder = Math.round(res.data.reminder / 30.4);
						this.reminder_select = 2;
					}
					else if(res.data.reminder > 365){
						this.reminder = Math.round(res.data.reminder / 365.25);
						this.reminder_select = 3;
					}
				}
				else{
					this.reminder_select = '';
					this.reminder = 0;
				}

				if(res.data.declaration_use > 0){
					if(res.data.declaration_use <= 30){
						this.declaration_use = Math.round(res.data.declaration_use);
						this.declaration_use_select = 1;
					}
					else if(res.data.declaration_use > 30 && res.data.declaration_use <= 365){
						this.declaration_use = Math.round(res.data.declaration_use / 30.4);
						this.declaration_use_select = 2;
					}
					else if(res.data.declaration_use > 365){
						this.declaration_use = Math.round(res.data.declaration_use / 365.25);
						this.declaration_use_select = 3;
					}
				}
				else{
					this.declaration_use_select = '';
					this.declaration_use = 0;
				}

				this.status_category_id = res.data.status_category_id * 1;
			})
		},

		async Save(){
			this.loading = true;
			let expiration = 0;
			let reminder = 0;
			let declaration_use = 0;

			if(this.expiration > 0){
				if(this.expiration_select == 1){
					expiration = this.expiration;
				}
				else if(this.expiration_select == 2){
					expiration = Math.round(this.expiration * 30.4);
				}
				else if(this.expiration_select == 3){
					expiration = Math.round(this.expiration * 365.25);
				}
			}
			else{
				expiration = 0;
			}

			if(this.reminder > 0){
				if(this.reminder_select == 1){
					reminder = this.reminder;
				}
				else if(this.reminder_select == 2){
					reminder = Math.round(this.reminder * 30.4);
				}
				else if(this.reminder_select == 3){
					reminder = Math.round(this.reminder * 365.25);
				}
			}
			else{
				reminder = 0;
			}

			if(this.declaration_use > 0){
				if(this.declaration_use_select == 1){
					declaration_use = this.declaration_use;
				}
				else if(this.declaration_use_select == 2){
					declaration_use = Math.round(this.declaration_use * 30.4);
				}
				else if(this.declaration_use_select == 3){
					declaration_use = Math.round(this.declaration_use * 365.25);
				}
			}
			else{
				declaration_use = 0;
			}

			if(this.subcategory_id){
				await this.$axios.put(`/api/subcategory/update/${this.subcategory_id}`, {subcategory:this.subcategory, status_category_id:this.status_category_id, declaration_use:declaration_use, renovation:this.renovation, reminder:reminder, expiration:expiration})
				.then(res => {
					this.subcategories[this.selected_subcategory] = res.data;
					this.snackbar = true;
					this.snackColor = 'success';
					this.snackText = 'Se guardó el registro exitosamente.';
					this.timeout = 3500;
					this.loading = false;
					this.subcat_dialog = false;
				})
				.catch(error => {
					this.errors = error.response.data.errors;
					this.snackbar = true;
					this.snackColor = 'error';
					this.snackText = 'No se pudo guardar el registro, revise los errores en el formulario.';
					this.timeout = 3500;
					this.loading = false;
				})
			}
			else{
				await this.$axios.post('/api/subcategory/store', {subcategory:this.subcategory, status_category_id:this.status_category_id, declaration_use:declaration_use, renovation:this.renovation, reminder:reminder, expiration:expiration})
				.then(res => {
					this.subcategories.unshift(res.data);
					this.snackbar = true;
					this.snackColor = 'success';
					this.snackText = 'Se guardó el registro exitosamente.';
					this.timeout = 3500;
					this.loading = false;
					this.subcat_dialog = false;
				})
				.catch(error => {
					this.errors = error.response.data.errors;
					this.snackbar = true;
					this.snackColor = 'error';
					this.snackText = 'No se pudo guardar el registro, revise los errores en el formulario.';
					this.timeout = 3500;
					this.loading = false;
				})
			}
		}
    } 
}
</script>