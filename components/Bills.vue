<template>
    <div>
        <v-dialog v-model="billing_dialog" fullscreen transition="dialog-bottom-transition" scrollable>
			<v-form @submit.prevent="Save">
				<v-card>
					<v-card-title class="primary white--text">
						Agregar Factura/Recibo
						<v-spacer></v-spacer>
						<v-btn icon @click="billing_dialog = false"><v-icon color="white">close</v-icon></v-btn>
					</v-card-title>
					<v-card-text class="mb-4">
						<v-container fluid>
							<v-row>
								<v-col cols="12" sm="12" md="7" lg="6">
									<v-autocomplete v-model="customer" v-if="!customer_disabled" :items="customers" outlined :loading="customerLoading" :search-input.sync="sync_customer" hide-no-data hide-selected item-text="customer" item-value="id" placeholder="Buscar cliente..." return-object :error-messages="errors.customer_id" label="Cliente" append-icon="clear" @click:append="ClearCustomer"></v-autocomplete>
                                    <v-text-field v-if="customer_disabled" outlined v-model="customer_name" readonly></v-text-field>
								</v-col>
                                <v-col cols="12" sm="12" md="3" lg="2">
                                    <v-select v-model="type" label="Tipo" @change="hasTax" outlined :items="types" item-value="id" item-text="type" :error-messages="errors.type"></v-select>
                                </v-col>
                                <v-col cols="12" sm="12" md="4" lg="2">
                                    <v-text-field v-model="folio" label="Folio" outlined append-icon="check" @click:append="CheckFolio" :error-messages="errors.folio"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="4" lg="2">
                                    <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y full-width min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="date" label="Fecha" append-icon="event" outlined readonly v-on="on" @click:append="date_menu = true"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="date" locale="es" color="light-blue darken-3" @input="date_menu = false" :error-messages="errors.date"></v-date-picker>
                                    </v-menu>
                                </v-col>
							</v-row>
                            <v-row>
                                <v-col sm="12" lg="12">
                                    <v-textarea v-model="comments" outlined label="Comentarios"></v-textarea>
                                </v-col>
                            </v-row>
                            <v-row>
								<v-btn large color="success" :loading="loading" @click="Save">Guardar<v-icon right>save</v-icon></v-btn>
							</v-row>
                            <br>
                            <v-simple-table class="elevation-4">
                                <thead>
                                    <tr>
                                        <th class="text-left" style="width:15%;">Fecha</th>
                                        <th class="text-left" style="width:30%;">Servicio</th>
                                        <th class="text-left" style="width:20%;">Cliente</th>
                                        <th class="text-left" style="width:5%;">Resp</th>
                                        <th class="text-right" style="width:10%;">Precio</th>
                                        <th class="text-right" style="width:10%;">Monto</th>
                                        <th style="width:10%;"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(service, index) in services" :key="index">
                                        <td title="service.id">{{ service.date }}</td>
                                        <td>{{ service.code }}<span v-if="service.brand"> - {{ service.brand }}</span><span v-if="service.class"> {{service.class}}</span></td>
                                        <td>{{service.customer}}</td>
                                        <td>{{ service.resp }}</td>
                                        <td class="text-right">{{ service.final_price }}</td>
                                        <td class="text-right" contenteditable>{{ service.biller }}</td>
                                        <td class="text-right">
                                            <v-btn fab x-small color="primary">
                                                <v-icon>add</v-icon>
                                            </v-btn>
                                        </td>
                                    </tr>
                                </tbody>
                            </v-simple-table>
                            <div class="pt-4"></div>
						</v-container>
					</v-card-text>
					<v-card-actions style="background-color:rgba(0,0,0,0.1); color: white; position:absolute; bottom: 0; width:100%;">
						<v-spacer></v-spacer>
						<v-btn text @click="billing_dialog = false">Cerrar</v-btn>
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
export default {
    data(){
        return{
            bill_id:'',
            customer_disabled:false,
            billing_dialog:false,
            customer_name:'',
            errors:{},
            //Customer
            customers:[],
            customer:'',
            customerLoading:false,
            sync_customer:'',
            customer_id:'',
            //Date
            loading: false,
            date: new Date().toISOString().substr(0, 10),
            date_menu:false,
            //Folio type
            type:'',
            types:[
                {id:'Factura', type:'Factura'},
                {id:'Recibo', type:'Recibo'}
            ],
            folio:'',
            comments:'',
            services:[],
            has_tax:false,
            tax_percent:0,
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
    },

    methods:{
        addBill()
        {
            this.billing_dialog = true;
            this.clearData();
            this.getTax();
        },

        async getTax(){
            await this.$axios.get('/api/tax')
            .then(res => {
                this.tax_percent = res.data;
            })
        },

        clearData(){
            this.errors = {};
            this.bill_id = '';
            this.customer_disabled = false;
            this.customer_name = '';
            this.type = '';
            this.folio = '';
            this.date = new Date().toISOString().substr(0, 10);
            this.customers = {};
            this.services = {};
            this.customer_id = '';
            this.customer = null;
        },

        customerSelect(val){
			this.customerLoading = true;
			this.$axios.post('/api/service/customers', {search:val})
			.then(res => {
				this.customers = res.data.data;
                this.customer_id = this.customer.id;
                this.customerLoading = false;
                this.errors = {};
			})
			.catch(error => {
				console.log(error);
				this.customerLoading = false;
			})
        },

        ClearCustomer(){
            this.customers = [];
            this.customer_id = '';
            this.customer = null;
            this.brand_id = '';
            this.brands = [];
        },

        hasTax(){
            if(this.type == 'Factura'){
                this.has_tax = 1;
            }
            else if(this.type == 'Recibo'){
                this.has_tax = 0;
            }
            else{
                this.has_tax = 0;
            }
        },

        async CheckFolio(){
            if(this.type == 'Factura'){
                await this.$axios.post('/api/bill-verify', {folio_bill:this.folio, type:this.type})
                .then(res => {
                    this.errors = {};
                    this.snackbar = true;
                    this.snackColor = 'success';
                    this.snackText = 'El folio está disponible';
                    this.timeout = 2000;
                })
                .catch(error => {
                    this.errors = error.response.data.errors;
                    this.errors.folio = error.response.data.errors.folio_bill;
                })
            }
            else if(this.type == 'Recibo'){
                await this.$axios.post('/api/receipt-verify', {folio_receipt:this.folio, type:this.type})
                .then(res => {
                    this.errors = {};
                    this.snackbar = true;
                    this.snackColor = 'success';
                    this.snackText = 'El folio está disponible';
                    this.timeout = 1500;
                })
                .catch(error => {
                    this.errors = error.response.data.errors;
                    this.errors.folio = error.response.data.errors.folio_receipt;
                })
            }
            else if(!this.type){
                this.snackbar = true;
                this.snackColor = 'error';
                this.snackText = 'Selecciona el tipo de movimiento';
                this.errors.type = 'Selecciona el tipo de movimiento';
                this.timeout = 1300;
            }
        },

        async Save(){
            this.loading = true;
            if(this.type == 'Factura'){
                await this.$axios.post('/api/bill/store', {customer_id:this.customer_id, type:this.type, folio_bill:this.folio, date:this.date, tax_percent:this.tax_percent})
                .then(res => {
                    
                    this.getPendingServices();
                    this.loading = false;
                })
                .catch(error => {
                    this.errors = error.response.data.errors;
                    this.snackColor = 'error';
                    this.snackText = 'No se pudo guardar el registro, revise los errores en el formulario.';
                    this.timeout = 1300;
                    this.loading = false;
                })
            }
            else if(this.type == 'Recibo'){
                await this.$axios.post('/api/receipt/store', {customer_id:this.customer_id, type:this.type, folio_receipt:this.folio, date:this.date})
                .then(res => {
                    
                    this.getPendingServices();
                    this.loading = false;
                })
                .catch(error => {
                    this.errors = error.response.data.errors;
                    this.snackColor = 'error';
                    this.snackText = 'No se pudo guardar el registro, revise los errores en el formulario.';
                    this.timeout = 1300;
                    this.loading = false;
                })
            }
            else if(!this.type){
                this.snackbar = true;
                this.snackColor = 'error';
                this.snackText = 'Selecciona el tipo de movimiento';
                this.errors.type = 'Selecciona el tipo de movimiento';
                this.timeout = 1300;
                this.loading = false;
            }
        },

        async getPendingServices(){
            await this.$axios.post('/api/services/pending-bills', {customer_id:this.customer_id})
            .then(res => {
                this.services = res.data;
            })
        },
    }
}
</script>