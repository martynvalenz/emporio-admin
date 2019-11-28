<template>
    <div>
        <v-dialog v-model="expense_dialog" max-width="1050" height="auto" style="overflow: auto;">
			<v-form @submit.prevent="Save">
				<v-card>
                    <v-system-bar color="primary" dark height="55px;">
                        <h2>{{title}}</h2>
                        <v-spacer></v-spacer>
                        <v-btn icon small @click="expense_dialog = false"><v-icon color="white">close</v-icon></v-btn>
                    </v-system-bar>
					<v-card-text>
						<v-container>
							<v-row>
								<v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                    <v-autocomplete v-model="provider" v-if="!new_provider" :items="providers" outlined :loading="providerLoading" :search-input.sync="sync_provider" hide-no-data hide-selected item-text="provider" item-value="id" placeholder="Buscar proveedor..." return-object :error-messages="errors.provider_id" label="Proveedor" append-icon="clear" @click:append="clearProvider" append-outer-icon="add" @click:append-outer="addProvider"></v-autocomplete>
                                    <v-text-field v-if="new_provider" outlined v-model="provider_name" :readonly="!new_provider" prepend-icon="close" @click:prepend="clearProvider" append-icon="save" @click:append="saveProvider" label="Agregar Proveedor" :error-messages="errors.provider" :loading="providerLoading"></v-text-field>
								</v-col>
                                <v-col cols="12" sm="12" md="3" lg="3" xl="3">
                                    <v-select v-model="type" :items="types" item-value="value" item-text="text" color="primary" outlined label="Tipo de Egreso *" :error-messages="errors.type"></v-select>
								</v-col>
                                <v-col cols="12" sm="12" md="3" lg="3" xl="3">
                                    <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y full-width min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="date" label="Fecha *" append-icon="event" outlined readonly v-on="on" @click:append="date_menu = true" :error-messages="errors.date"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="date" locale="es" color="light-blue darken-3" @input="date_menu = false"></v-date-picker>
                                    </v-menu>
								</v-col>
							</v-row>
                            
                            <v-row>
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-select v-model="account_id" @change="setPaymentMethod" outlined label="Cuenta *" :items="accounts" item-value="id" item-text="alias" append-icon="close" @click:append="account_id = ''" :error-messages="errors.account_id"></v-select>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="4">
                                    <v-select v-model="paying_method_id" outlined label="Forma de pago *" :items="paying_methods" item-value="id" item-text="paying_method" :error-messages="errors.paying_method_id"></v-select>
                                </v-col>
                            </v-row>

                            <v-row>
								<v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                    <v-checkbox v-model="service_payments" label="Aplicar egreso a servicio" color="primary"></v-checkbox>
								</v-col>
							</v-row>
                            <v-row>
                                <v-col cols="12" xs="12">
                                    <v-autocomplete v-model="service" v-if="service_payments" :items="services" outlined :loading="serviceLoading" :search-input.sync="sync_service" hide-no-data hide-selected item-text="service" item-value="id" placeholder="Buscar servicio..." return-object :error-messages="errors.service_id" label="Servicio" append-icon="clear" @click:append="clearService"></v-autocomplete>
                                </v-col>
                            </v-row>
                            <hr>

                            <v-row>
                                <v-col cols="12" sm="12" md="6" lg="2">
                                    <v-checkbox v-model="has_tax" color="primary" label="Con IVA"></v-checkbox>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="2">
                                    <v-text-field v-model="tax_percent" filled color="primary" label="%IVA" type="number" step="any" min="0" readonly></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="2">
                                    <v-text-field v-model="withdraw" outlined color="primary" label="Monto *" type="number" step="any" min="0"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-text-field v-model="cheque" outlined color="primary" label="Cheque"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-text-field v-model="movimiento" outlined color="primary" label="Movimiento"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" xs="12">
                                    <v-textarea v-model="comment" outlined label="Comentarios (opcional)"></v-textarea>
                                </v-col>
                            </v-row>
						</v-container>
					</v-card-text>
					<v-card-actions style="background-color:rgba(0,0,0,0.1); color: white; position:absolute; bottom: 0; width:100%;">
						<v-spacer></v-spacer>
						<v-btn text @click="expense_dialog = false">Cerrar</v-btn>
						<v-btn class="primary" :loading="loading" @click="saveExpense">Guardar <v-icon right>save</v-icon></v-btn>
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
        </v-snackbar>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    data(){
        return{
            expense_dialog:false,
            title:'',
            //Provider
            provider_id:'',
            providers:[],
            provider:'',
            new_provider:false,
            provider_name:'',
            providerLoading:false,
            sync_provider:'',
            service_payments:0,
            //Servicios
            service_id:'',
            services:[],
            service:'',
            serviceLoading:false,
            sync_service:'',
            //Form
            errors:[],
            loading:false,
            date_menu:false,
            date:new Date().toISOString().substr(0, 10),
            account_id:'',
            accounts:[],
            paying_method_id:'',
            paying_methods:[],
            comment:'',
            type:'',
            types:[
                {value:1, text:'Despacho'},
                {value:2, text:'Hogar'},
                {value:3, text:'Personal'},
                // {value:4, text:'Traspaso'},
                // {value:5, text:'Nómina'},
                // {value:6, text:'Comisión'},
                // {value:7, text:'Ingreso'},
                {value:8, text:'Tarjeta de crédito'},
                // {value:9, text:'Préstamo'}
            ],
            //withdraws
            tax_percent:0,
            has_tax:0,
            withdraw:0,
            cheque:'',
            movimiento:'',
            //Snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
			timeout: 6000,
        }
    },

    watch: {
        sync_provider(val){
			if(val){
				val && val !== this.provider && this.providerSelect(val)
			}
			else{
				this.providers = [];
				this.provider_id = '';
				this.provider = null;
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
        },
    },

    methods:{
        createExpense(){
            this.expense_dialog = true;
            this.title = 'Crear Egreso';
            this.clearDataInit();
            this.getAccounts();
            this.getTax();
        },

        clearDataInit(){
            //Servicios
            this.service_id = '';
            this.services = [];
            this.service = '';
            this.serviceLoading = false;
            this.sync_service = '';
            //Provider
            this.provider_id = '';
            this.providers = [];
            this.provider = '';
            this.new_provider = false;
            this.provider_name = '';
            this.providerLoading = false;
            this.sync_provider = '';
            this.service_payments = 0;
            //Form
            this.errors = [];
            this.date = new Date().toISOString().substr(0, 10);
            this.account_id = '';
            this.paying_method_id = '';
            this.comment = '';
            this.type = '';
            //withdraws
            this.has_tax = 0;
            this.withdraw = 0;
            this.cheque = '';
            this.movimiento = '';
        },

        clearData(){
            //Servicios
            this.service_id = '';
            this.services = [];
            this.service = '';
            this.serviceLoading = false;
            this.sync_service = '';
            //Form
            this.errors = [];
            // this.date = new Date().toISOString().substr(0, 10);
            // this.account_id = '';
            // this.accounts = [];
            // this.paying_method_id = '';
            // this.paying_methods = [];
            this.comment = '';
            // this.type = '';
            // this.types = [],
            //withdraws
            // this.tax_percent = 0;
            // this.has_tax = 0;
            this.withdraw = 0;
            this.cheque = '';
            this.movimiento = '';
        },

        async getAccounts(){
            await this.$axios.get('/api/accounts-list')
            .then(res => {
                this.accounts = res.data.accounts;
                this.paying_methods = res.data.paying_methods;
            })
        },

        async getTax(){
            await this.$axios.get('/api/tax')
            .then(res => {
                this.tax_percent = res.data.tax_percent;
            })
        },

        providerSelect(val){
            this.providerLoading = true
            this.$axios.post('/api/providers-list', {search:val})
            .then(res => {
                this.providers = res.data;
                this.provider_id = this.provider.id;
                this.provider_name = this.provider.provider;
                this.service_payments = this.provider.service_payments;
                this.providerLoading = false;
            })
        },

        serviceSelect(val){
            this.serviceLoading = true
            this.$axios.post('/api/service-pending', {search:val})
            .then(res => {
                this.services = res.data.data;
                this.service_id = this.services.id;
                this.serviceLoading = false;
            })
        },

        clearProvider(){
            this.new_provider = false;
            this.provider_name = '';
            this.providers = [];
            this.provider_id = '';
            this.provider = '';
            this.providerLoading = false;
        },

        clearService(){
            this.services = [];
            this.service_id = '';
            this.service = '';
            this.serviceLoading = false;
        },
        
        addProvider(){
            this.provider = '';
            this.new_provider = true;
        },

        async saveProvider(){
            this.providerLoading = true;
            await this.$axios.post('/api/provider/fast-store', {provider:this.provider_name})
            .then(res => {
                this.providers.unshift(res.data);
                this.new_provider = false;
                this.provider_id = res.data.id;
                this.provider = res.data;
                this.errors = {};
                this.snackbar = true;
                this.snackColor = 'success';
                this.snackText = 'Se agregó el proveedor exitosamente';
                this.timeout = 2000;
                this.providerLoading = false;
            })
            .catch(error => {
                this.errors = error.response.data.errors;
                this.providerLoading = false;
            })
        },

        setPaymentMethod(){
            if(this.account_id){
                if(this.account_id == 1){
                    this.paying_method_id = 1;
                }
                else{
                    this.paying_method_id = 3;
                }
            }
        },

        async saveExpense(){
            this.loading = true;
            await this.$axios.post('/api/account-statement/expense', {type:this.type, comment:this.comment, date:this.date, cheque:this.cheque, movimiento:this.movimiento, withdraw:this.withdraw, has_tax:this.has_tax, tax_percent:this.tax_percent, paying_method_id:this.paying_method_id, account_id:this.account_id, provider_id:this.provider_id})
            .then(res =>{
                this.$emit('newExpense', res.data);
                this.clearData();
                this.snackbar = true;
                this.snackColor = 'success';
                this.snackText = 'Se agregó el registro exitosamente';
                this.timeout = 2000;
                this.loading = false;
            })
            .catch(error => {
                this.errors = error.response.data.errors;
                this.snackbar = true;
                this.snackColor = 'error';
                this.snackText = 'No se pudo agregar el registro, revise los errores en el formulario';
                this.timeout = 3000;
                this.loading = false;
            })
        }
    }
}
</script>

<style>
    
</style>