<template>
    <div>
        <v-dialog v-model="service_dialog" fullscreen transition="dialog-bottom-transition" scrollable>
			<v-form @submit.prevent="Save">
				<v-card>
					<v-card-title class="primary white--text">
						Agregar cliente
						<v-spacer></v-spacer>
						<v-btn icon @click="service_dialog = false"><v-icon>close</v-icon></v-btn>
					</v-card-title>
					<v-card-text>
						<v-container fluid>
							<v-row>
								<v-col cols="12" sm="12" md="7" lg="6">
									<v-autocomplete v-model="customer" :items="customers" outlined :loading="customerLoading" :search-input.sync="sync_customer" hide-no-data hide-selected item-text="customer" item-value="id" placeholder="Buscar cliente..." return-object clearable :error-messages="errors.customer_id" label="Cliente"></v-autocomplete>
								</v-col>
                                <v-spacer></v-spacer>
                                <v-col cols="12" sm="12" md="4" lg="2">
                                    <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y full-width min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="date" label="Fecha" append-icon="event" outlined readonly v-on="on"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="date" locale="es" color="light-blue darken-3" @input="date_menu = false"></v-date-picker>
                                    </v-menu>
                                </v-col>
							</v-row>
                            <v-row>
                                <v-col cols="12" sm="12" md="8" lg="8">
                                    <v-select v-model="brand_id" outlined :items="brands" item-value="id" item-text="brand" label="Marca o aviso comercial" :error-messages="errors.brand_id"></v-select>
                                </v-col>
                                <v-col cols="12" sm="12" md="2" lg="2">
                                    <v-select v-model="class_id" outlined :items="classes" item-value="id" item-text="class" label="Clase" :error-messages="errors.brand_id"></v-select>
                                </v-col>
                            </v-row>
							<v-row>
								<v-col cols="12" sm="12" md="8" lg="8">
                                    <v-autocomplete v-model="service" :items="services" outlined :loading="serviceLoading" :search-input.sync="sync_service" hide-no-data hide-selected item-text="service" item-value="id" placeholder="Buscar servicio..." return-object clearable :error-messages="errors.service_id" label="Servicio"></v-autocomplete>
                                </v-col>
							</v-row>
                            <v-divider></v-divider>
                            <v-row>
								<v-col cols="12" sm="12" md="12" lg="12">
                                    <v-textarea v-model="comments" label="Comentarios (opcional)" outlined></v-textarea>
                                </v-col>
							</v-row>
						</v-container>
					</v-card-text>
					<v-card-actions style="background-color:rgba(0,0,0,0.1); color: white; position:absolute; bottom: 0; width:100%;">
						<v-spacer></v-spacer>
						<v-btn text @click="service_dialog = false">Cerrar</v-btn>
					</v-card-actions>
				</v-card>
			</v-form>
		</v-dialog>
        <v-snackbar
            v-model="snackbar"
            :timeout="timeout"
            top
            right
            :color="snackColor"
            >
            {{ snackText }}
            <v-btn
                color="white"
                text
                @click="snackbar = false"
                >
                Cerrar
            </v-btn>
        </v-snackbar>
    </div>
</template>

<script>
export default {
    data(){
        return{
            service_dialog:false,
            errors:{},
            //Customer
            customers:[],
            customer:'',
            customerLoading:false,
            sync_customer:'',
            customer_id:'',
            //Service
            services:[],
            service:'',
            serviceLoading:false,
            sync_service:'',
            service_id:'',
            //Data
            brand_id:'',
            brands:[],
            classes:[],
            class_id:'',
            comments:'',

            loading: false,
            date: new Date().toISOString().substr(0, 10),
            date_menu:false,
			//snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
			timeout: 6000,
        }
    },

    watch: {
		sync_customer(val){
			if(val){
				val && val !== this.customer && this.customerSelect(val)
			}
			else{
				this.customers = [];
				this.customer_id = '';
				this.customer = null;
			}
        },
        
        sync_service(val){
			if(val){
				val && val !== this.service && this.serviceSelect(val)
			}
			else{
				this.services = [];
				this.service_id = '';
				this.service = null;
			}
		}
	},

    methods:{
        addService()
        {
            this.service_dialog = true;
            this.getClasses();
            // this.clearForm();
        },

        changeStrategy(){
			if(this.strategy_id !== 1){
				this.referred_by = '';
				this.referrals = '';
				this.referred = null;
			}
        },
        
        customerSelect(val){
			this.customerLoading = true;
			this.$axios.post('/api/service/customers', {search:val})
			.then(res => {
				this.customers = res.data.data;
                this.customer_id = this.customer.id;
                this.getBrands();
				this.customerLoading = false;
			})
			.catch(error => {
				console.log(error);
				this.customerLoading = false;
			})
        },

        serviceSelect(val){
			this.serviceLoading = true;
			this.$axios.post('/api/services/list', {search:val})
			.then(res => {
				this.services = res.data;
				this.service_by = this.service.id;
                this.serviceLoading = false;
			})
			.catch(error => {
				console.log(error);
				this.serviceLoading = false;
			})
        },

        async getBrands(){
            await this.$axios.post('/api/service/customer-brands', {customer_id:this.customer_id})
            .thend(res => {
                this.brands = res.data;
            })
            .catch(error => {
                this.errors = error.response.data.errors;
            })
        },

        async getClasses(){
            await this.$axios.get('/api/classes-list')
            .then(res => {
                this.classes = res.data;
            })
        },
        
        clearForm(){
            this.customer = '';
            this.strategy_id = '';
            this.strategies = [];
            this.errors = {};
        },

        async Save(){
            await this.$axios.post('/api/customer', {customer:this.customer, strategy_id:this.strategy_id, referred_by:this.referred_by})
            .then(res => {
                this.loading = false;
                this.clearForm();
                this.service_dialog = false;
                this.snackColor = 'success';
                this.snackbar = true;
                this.snackText = 'Se agregó el cliente '+res.data.customer;
            })
            .catch(error => {
                this.loading = false;
                this.errors = error.response.data.errors;
                this.error_alert = true;
                this.snackColor = 'error';
                this.snackbar = true;
                this.snackText = 'No se pudo agregar el cliente, revise los errores en el formulario.';
            })
        },
    }
}
</script>