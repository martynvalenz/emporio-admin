<template>
    <div>
        <v-dialog v-model="billing_dialog" fullscreen transition="dialog-bottom-transition" scrollable>
			<v-form>
				<v-card>
                    <v-system-bar color="primary" dark height="60px;">
                        <h2>Agregar Factura/Recibo</h2>
                        <v-spacer></v-spacer>
                        <v-btn icon small @click="billing_dialog = false"><v-icon color="white">close</v-icon></v-btn>
                    </v-system-bar>
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
                            <v-row v-if="!bill_id">
								<v-col>
                                    <v-btn color="warning" dark class="mx-1" :loading="loading" @click="SavePendient(0)">Guardar Pendiente<v-icon right>save</v-icon></v-btn>
                                    <v-btn color="error" dark class="mx-1" :loading="loading" @click="SavePendient(2)">Guardar Cancelado<v-icon right>block</v-icon></v-btn>
                                </v-col>
							</v-row>
                            <v-row>
                                <v-col sm="12" lg="12">
                                    <v-textarea v-model="comments" outlined label="Comentarios"></v-textarea>
                                </v-col>
                            </v-row>
                            <v-row v-if="customer_id">
                                <v-col sm="12" lg="12">
                                    <v-spacer></v-spacer>
                                    <v-btn large icon @click="Refresh"><v-icon>sync</v-icon></v-btn>
                                </v-col>
                            </v-row>
                            <v-card v-if="customer_id" class="elevation-1" :loading="loading_services">
                                <v-card-text>
                                    <v-simple-table class="elevation-4" >
                                        <thead>
                                            <tr>
                                                <th class="text-left" style="width:12%;">Fecha</th>
                                                <th class="text-left" style="width:28%;">Servicio</th>
                                                <th class="text-left" style="width:5%;">Resp</th>
                                                <th class="text-center" style="width:10%;">Cobranza</th>
                                                <th class="text-center" style="width:10%;">Trámite</th>
                                                <th class="text-right" style="width:10%;">Pendiente</th>
                                                <th class="text-right" style="width:10%;">Monto</th>
                                                <th style="width:15%;"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                           <template v-if="billed_services.length > 0">
                                                <tr v-for="(service, index) in billed_services" :key="index">
                                                    <td title="service.id">{{ service.date }}</td>
                                                    <td>{{ service.code }}<span v-if="service.brand"> - {{ service.brand }}</span><span v-if="service.class"> {{service.class}}</span></td>
                                                    <td>{{ service.resp }}</td>
                                                    <td v-if="service.status < 2" class="text-center">
                                                        <v-chip label small v-if="service.is_payed == 0" class="warning">Pendiente</v-chip>
                                                        <v-chip label small v-if="service.is_payed == 1" :title="service.date_payed" class="success">Pagado</v-chip>
                                                    </td>
                                                    <td v-else class="text-center">
                                                        <v-chip label small v-if="service.status == 2" class="error">Cancelado</v-chip>
                                                        <v-chip label small v-if="service.status == 3" class="error">No Registro</v-chip>
                                                        <v-chip label small v-if="service.status == 4" class="orange darken-1">Repetido</v-chip>
                                                    </td>
                                                    <!-- Div -->
                                                    <td class="text-center">
                                                        <v-chip label small v-if="service.status == 0" class="warning">Pendiente</v-chip>
                                                        <v-chip label small v-if="service.status == 1" class="success" :title="service.date_registered">Terminado</v-chip>
                                                        <v-chip label small v-if="service.status == 2" color="error">Cancelado</v-chip>
                                                        <v-chip label small v-if="service.status == 3" class="error">No Registro</v-chip>
                                                        <v-chip label small v-if="service.status == 4" color="orange darken-1">Repetido</v-chip>
                                                    </td>
                                                    <!-- Status -->
                                                    <td class="text-right">{{ service.pending_biller }}</td>
                                                    <td class="text-right">
                                                        <v-edit-dialog :return-value.sync="service.biller" large persistent>
                                                            <div><b>{{ service.biller }}</b></div>
                                                            <template v-slot:input>
                                                                <v-text-field v-model="service.biller" label="Editar monto" single-line autofocus max="service.biller" type="number" step="any"></v-text-field>
                                                            </template>
                                                        </v-edit-dialog>
                                                    </td>
                                                    <td class="text-right">
                                                        <v-btn fab dark x-small color="green">
                                                            <v-icon>save</v-icon>
                                                        </v-btn>
                                                        <v-btn fab dark x-small color="error">
                                                            <v-icon @click="Delete(index)">close</v-icon>
                                                        </v-btn>
                                                    </td>
                                                </tr>
                                           </template>
                                           <template v-if="services.length > 0">
                                                <tr v-for="(service, index) in services" :key="index">
                                                    <td title="service.id">{{ service.date }}</td>
                                                    <td>{{ service.code }}<span v-if="service.brand"> - {{ service.brand }}</span><span v-if="service.class"> {{service.class}}</span></td>
                                                    <td>{{ service.resp }}</td>
                                                    <td v-if="service.status < 2" class="text-center">
                                                        <v-chip label small v-if="service.is_payed == 0" class="warning">Pendiente</v-chip>
                                                        <v-chip label small v-if="service.is_payed == 1" :title="service.date_payed" class="success">Pagado</v-chip>
                                                    </td>
                                                    <td v-else class="text-center">
                                                        <v-chip label small v-if="service.status == 2" class="error">Cancelado</v-chip>
                                                        <v-chip label small v-if="service.status == 3" class="error">No Registro</v-chip>
                                                        <v-chip label small v-if="service.status == 4" class="orange darken-1">Repetido</v-chip>
                                                    </td>
                                                    <!-- Div -->
                                                    <td class="text-center">
                                                        <v-chip label small v-if="service.status == 0" class="warning">Pendiente</v-chip>
                                                        <v-chip label small v-if="service.status == 1" class="success" :title="service.date_registered">Terminado</v-chip>
                                                        <v-chip label small v-if="service.status == 2" color="error">Cancelado</v-chip>
                                                        <v-chip label small v-if="service.status == 3" class="error">No Registro</v-chip>
                                                        <v-chip label small v-if="service.status == 4" color="orange darken-1">Repetido</v-chip>
                                                    </td>
                                                    <!-- Status -->
                                                    <td class="text-right">{{ service.pending_biller }}</td>
                                                    <td class="text-right">
                                                        <v-edit-dialog :return-value.sync="service.biller" large persistent>
                                                            <div><b>{{ service.biller }}</b></div>
                                                            <template v-slot:input>
                                                                <v-text-field v-model="service.biller" label="Editar monto" single-line autofocus max="service.biller" type="number" step="any"></v-text-field>
                                                            </template>
                                                        </v-edit-dialog>
                                                    </td>
                                                    <td class="text-right">
                                                        <v-btn fab x-small dark color="primary" v-if="bill_id">
                                                            <v-icon>add</v-icon>
                                                        </v-btn>
                                                        <v-btn fab dark x-small color="error">
                                                            <v-icon @click="Delete(index)">close</v-icon>
                                                        </v-btn>
                                                    </td>
                                                </tr>
                                           </template>
                                        </tbody>
                                    </v-simple-table>
                                </v-card-text>
                            </v-card>
                            <div class="pa-1"></div>
                            <v-row>
								<v-col>
                                    <v-btn color="green" dark class="mx-1" :loading="loading" @click="Save">Guardar<v-icon right>save</v-icon></v-btn>
                                    <v-btn v-if="bill_id" color="warning" class="mx-1" :loading="loading_free" @click="Free">Liberar Factura<v-icon right>settings_backup_restore</v-icon></v-btn>
                                    <v-btn v-if="bill_id" color="error" class="mx-1" :loading="loading_cancel" @click="Cancel">Cancelar Factura <v-icon right>block</v-icon></v-btn>
                                </v-col>
							</v-row>
						</v-container>
                        <v-container>
                            <v-row class="d-flex flex-row-reverse">
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-simple-table class="elevation-4">
                                        <tbody>
                                            <tr>
                                                <td><h4>Subtotal</h4></td>
                                                <td class="text-right" v-if="!bill_id"><h4>$ {{formatPrice(calculated)}}</h4></td>
                                                <td class="text-right" v-if="bill_id"><h4>$ {{formatPrice(subtotal)}}</h4></td>
                                            </tr>
                                            <tr>
                                                <td><v-checkbox label="%IVA" color="primary" v-model="has_tax" :readonly="has_tax_readonly" @change="updateTAX"></v-checkbox></td>
                                                <td class="text-right"><h4>{{tax_percent}}</h4></td>
                                            </tr>
                                            <tr>
                                                <td><h4>IVA</h4></td>
                                                <td class="text-right" v-if="!bill_id"><h4>$ {{formatPrice(taxCalc)}}</h4></td>
                                                <td class="text-right" v-if="bill_id"><h4>$ {{formatPrice(tax)}}</h4></td>
                                            </tr>
                                            <tr>
                                                <td><h4>Total</h4></td>
                                                <td class="text-right" v-if="!bill_id"><h4>$ {{formatPrice(totalCalc)}}</h4></td>
                                                <td class="text-right" v-if="bill_id"><h4>$ {{formatPrice(total)}}</h4></td>
                                            </tr>
                                        </tbody>
                                    </v-simple-table>
                                </v-col>
                            </v-row>
                        </v-container>
                        <hr v-if="bill_id">
                        <v-container v-if="bill_id">
                            <v-row>
                                <v-col cols="12" sm="12" md="12" lg="12">
                                    <h2>Capturar ingresos del cliente</h2>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-text-field v-model="ammount" label="Monto" type="number" step="any" min="0" outlined :error-messages="errors.deposit"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-menu v-model="date_payed_menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y full-width min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="date_payed" label="Fecha" append-icon="event" outlined readonly v-on="on" @click:append="date_payed_menu = true"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="date_payed" locale="es" color="light-blue darken-3" @input="date_payed_menu = false" :error-messages="errors.date_payed"></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-text-field v-model="movement" label="# Movimiento" outlined></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-text-field v-model="check" label="Cheque" outlined></v-text-field>
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
                                <v-col cols="12" sm="12">
                                    <v-textarea v-model="paying_comments" label="Comentarios (opcional)" outlined></v-textarea>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="12">
                                    <v-btn color="primary" @click="Income" :loading="income_loading">Generar Ingreso<v-icon right>money</v-icon></v-btn>
                                </v-col>
                            </v-row>
                        </v-container>
                        <hr v-if="bill_id">
                        <v-container v-if="bill_id">
                            <v-row>
                                <v-col cols="12" sm="12" md="12" lg="12">
                                    <h2>Pago de Factura/Recibo</h2>
                                </v-col>
                            </v-row>
                            <v-row v-show="paying_alert">
                                <v-alert text prominent type="warning" icon="mdi-cloud-alert"><p>El monto a pagar es menor que el saldo disponible del cliente, ¿desea continuar con el pago o capturar otro ingreso del cliente?</p><v-btn class="ma-1" color="green" dark @click="ContinuePayment">Continuar</v-btn><v-btn class="ma-1" color="warning" dark @click="CancelPayment">Cancelar</v-btn></v-alert>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-text-field v-model="customers_balance" label="Saldo del cliente" type="number" readonly step="any" min="0" filled></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-text-field v-model="balance" label="Monto pendiente de factura" readonly type="number" step="any" min="0" filled></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-text-field v-model="bill_pending" :error-messages="errors.bill_pending" label="Monto a pagar de la factura *" type="number" step="any" min="0" outlined></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-btn color="green" dark block large :loading="pay_load" @click="PayLoad">Pagar Factura<v-icon right>check</v-icon></v-btn>
                                </v-col>
                            </v-row>
                        </v-container>
                        <div class="pt-4"></div>
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
            from_bill:1,//1.Service 2.Bill 3.Receipt 4.Pending
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
            loading_free: false,
            loading_cancel: false,
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
            billed_services:[],
            loading_services:false,
            has_tax:false,
            has_tax_readonly:false,
            tax_percent:0,
            tax:0,
            subtotal:0,
            balance:0,
            total:0,
            calculated_subtotal:0,
            service_selected:'',
            payed_ammount:0,
            //Payment
            ammount:0,
            date_payed:new Date().toISOString().substr(0, 10),
            date_payed_menu:false,
            movement:'',
            check:'',
            account_id:'',
            accounts:[],
            paying_method_id:'',
            paying_methods:[],
            paying_comments:'',
            income_loading:false,
            //Pay Bill
            customers_balance:0,
            customer_payment:0,
            bill_pending:0,
            pay_load:false,
            paying_alert:false,
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

    computed:{
        calculated: function(){
            if(this.services.length > 0){
                return this.services.reduce(function(total, item){
                    return (total * 1) + (item.biller * 1);
                }, 0);
            }
            else{
                return 0;
            }
        },

        taxCalc: function(){
            const tax_percent = this.tax_percent;
            if(this.services.length > 0 && this.has_tax){
                return this.services.reduce(function(tax, item){
                    return (tax * 1) + (((item.biller * 1) * ((tax_percent * 1) / 100)) * 1);
                }, 0);
            }
            else{
                return 0;
            }
        },

        totalCalc: function(){
            const tax_percent = this.tax_percent;
            if(this.services.length > 0){
                if(this.has_tax){
                    return this.services.reduce(function(total, item){
                        return (total * 1) + (((item.biller * 1) * (1 + ((tax_percent * 1) / 100))) * 1);
                    }, 0);
                }
                else{
                    return this.services.reduce(function(total, item){
                        return (total * 1) + ((item.biller * 1));
                    }, 0);
                }
            }
            else{
                return 0;
            }
        },
    },

    methods:{
        addBill(from_bill)
        {
            this.from_bill = from_bill;
            this.billing_dialog = true;
            this.clearData();
            this.getTax();
            this.getBillLastFolio();
        },
        
        addBillAlready(customer_id, customer, type, from_bill){
            this.from_bill = from_bill;
            this.billing_dialog = true;
            this.customer_disabled = true;
            this.customer_id = customer_id;
            this.customer_name = customer;
            this.type = type;
            this.errors = {};
            this.billed_services = {};
            this.bill_id = '';
            this.folio = '';
            this.date = new Date().toISOString().substr(0, 10);
            this.customers = {};
            this.customer = null;
            this.getTax();
            if(type == 'Factura'){
                this.has_tax = true;
                this.has_tax_readonly = true;
            }
            else if(type == 'Recibo'){
                this.has_tax = false;
                this.has_tax_readonly = false;
            }
            this.getPendingServices();
            this.getCustomersBalance();
            this.getBillLastFolio();
        },

        async getBillLastFolio(){
            if(!this.bill_id && this.type){
                await this.$axios.post('/api/bills/get-folio', {type:this.type})
                .then(res => {
                    this.folio = res.data;
                    this.errors = {};
                })
            }
        },

        async editBill(bill_id, from_bill){
            this.bill_id = bill_id;
            if(bill_id){
                await this.$axios.get(`/api/bill/edit/${bill_id}`)
                .then(res => {
                    this.from_bill = from_bill;
                    this.billing_dialog = true;
                    this.customer_disabled = true;
                    this.customer_id = res.data.customer_id;
                    this.customer_name = res.data.customer;
                    this.customer_balance = res.data.customer_balance;
                    this.type = res.data.type;
                    this.folio = res.data.folio;
                    this.date = res.data.date;
                    this.tax_percent = res.data.tax_percent;
                    this.subtotal = res.data.subtotal;
                    this.tax = res.data.tax;
                    this.total = res.data.total;
                    this.is_payed = res.data.is_payed;
                    this.balance = res.data.balance;
                    this.payed_ammount = res.data.payed_ammount;
                    this.ammount = res.data.balance;
                    this.bill_pending = res.data.balance;
                    this.errors = {};
                    this.customers = {};
                    this.customer = null;
                    if(res.data.has_tax == 1){
                        this.has_tax = true;
                    }
                    else if(res.data.has_tax == 0){
                        this.has_tax = false;
                    }
                    if(res.data.type == 'Factura'){
                        this.has_tax_readonly = true;
                    }
                    else if(res.data.type == 'Recibo'){
                        this.has_tax_readonly = false;
                    }
                    this.paying_alert = false;
                    this.getBillServices();
                    this.getAccounts();
                    this.getCustomersBalance();
                })
            }
        },
        
        async getTax(){
            await this.$axios.get('/api/tax')
            .then(res => {
                this.tax_percent = res.data.tax_percent;
            })
        },

        Refresh(){
            if(this.bill_id){
                this.getBillServices();
            }
            else{
                this.getPendingServices();
            }
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
            this.billed_services = {};
            this.customer_id = '';
            this.customer = null;
            this.paying_alert = false;
        },

        customerSelect(val){
			this.customerLoading = true;
			this.$axios.post('/api/service/customers', {search:val})
			.then(res => {
				this.customers = res.data.data;
                this.customer_id = this.customer.id;
                this.customer_name = this.customer.customer;
                this.getPendingServices();
                this.getCustomersBalance();
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
            this.services = [];
        },

        async getCustomersBalance(){
            if(this.customer_id){
                await this.$axios.get(`/api/customers-balance/${this.customer_id}`)
                .then(res => {
                    this.customers_balance = res.data.balance;
                    this.ammount = this.total - this.customers_balance - this.payed_ammount;
                })
            }
        },

        hasTax(){
            if(this.type == 'Factura'){
                this.has_tax = 1;
                this.has_tax_readonly = true;
                this.updateTAX();
            }
            else if(this.type == 'Recibo'){
                this.has_tax = 0;
                this.has_tax_readonly = false;
                this.updateTAX();
            }
            else{
                this.has_tax = 0;
                this.has_tax_readonly = false;
                this.updateTAX();
            }
            this.getBillLastFolio();
        },

        updateTAX(){
            if(this.bill_id){
                this.$axios.put(`/api/bill/update-tax/${this.bill_id}`, {has_tax:this.has_tax, tax_percent:this.tax_percent})
                .then(res => {
                    this.subtotal = res.data.subtotal;
                    this.tax = res.data.tax;
                    this.total = res.data.total;
                    this.is_payed = res.data.is_payed;
                    this.balance = res.data.balance;
                    this.payed_ammount = res.data.payed_ammount;
                    this.ammount = res.data.total;
                    this.bill_pending = res.data.balance;
                })
            }
        },

        async CheckFolio(){
            if(this.type){
                await this.$axios.post('/api/bill-verify', {folio:this.folio, type:this.type})
                .then(res => {
                    this.errors = {};
                    this.snackbar = true;
                    this.snackColor = 'success';
                    this.snackText = 'El folio está disponible';
                    this.timeout = 2000;
                })
                .catch(error => {
                    this.errors = error.response.data.errors;
                    this.errors.folio = error.response.data.errors.folio;
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
            if(this.bill_id){

            }
            else{
                await this.$axios.post('/api/bill/store', {customer_id:this.customer_id, type:this.type, folio:this.folio, date:this.date, tax_percent:this.tax_percent, has_tax:this.has_tax, services:this.services, services_length:this.services.length})
                .then(success => {
                    this.bill_id = success.data.id;
                    this.customer_disabled = true;
                    this.customer_name = success.data.customer;
                    this.tax_percent = success.data.tax_percent;
                    this.subtotal = success.data.subtotal;
                    this.tax = success.data.tax;
                    this.total = success.data.total;
                    this.is_payed = success.data.is_payed;
                    this.balance = success.data.balance;
                    this.ammount = success.data.balance;
                    this.payed_ammount = success.data.payed_ammount;
                    this.bill_pending = success.data.balance;
                    this.customer_balance = success.data.customer_balance;
                    this.errors = {};
                    this.customers = {};
                    this.customer = null;
                    this.getBillServices();
                    if(this.from_bill == 1){
                        this.$emit('updateServices');
                    }
                    else if(this.from_bill == 2 || this.from_bill == 3){
                        this.$emit('newBill', res.data)
                    }
                    this.getAccounts();
                    this.loading = false;
                    this.snackbar = true;
                    this.snackColor = 'success';
                    this.snackText = 'Se guardó el registro exitosamente.';
                    this.timeout = 1300;
                })
                .catch(error => {
                    if(error.response.data.success == false){
                        this.snackbar = true;
                        this.snackColor = 'error';
                        this.snackText = error.response.data.msg;
                        this.timeout = 5000;
                        this.loading = false;
                    }else{
                        this.errors = error.response.data.errors;
                        this.snackbar = true;
                        this.snackColor = 'error';
                        this.snackText = 'No se pudo guardar el registro, revise los errores en el formulario.';
                        this.timeout = 1300;
                        this.loading = false;
                    }
                })
            }
        },

        SavePendient(status){
            this.loading = true;
            this.$axios.post('/api/bill/save-pendient', {type:this.type, folio:this.folio, customer_id:this.customer_id, date:this.date, comments:this.comments, has_tax:this.has_tax, tax_percent:this.tax_percent, status:status})
            .then(res => {
                this.customer_id = ''
                this.comments = '';
                this.errors = {};
                this.getBillLastFolio();
                this.snackbar = true;
                this.snackColor = 'success';
                this.snackText = 'Se guardó el registro exitosamente.';
                this.timeout = 1500;
                this.loading = false;
            })
            .catch(error => {
                this.errors = error.response.data.errors;
                this.loading = false;
                this.snackbar = true;
                this.snackColor = 'error';
                this.snackText = 'No se pudo guardar el registro, revise los errores en el formulario.';
                this.timeout = 1500;
                this.loading = false;
            })
        },

        async getPendingServices(){
            this.loading_services = true;
            if(this.customer_id){
                await this.$axios.post('/api/services/pending-bills', {customer_id:this.customer_id})
                .then(res => {
                    this.services = res.data;
                    this.loading_services = false;
                })
            }
        },

        async getBillServices(){
            this.loading_services = true;
            if(this.customer_id){
                await this.$axios.get(`/api/bill/services/${this.bill_id}/${this.customer_id}`)
                .then(res => {
                    this.billed_services = res.data.billed_services;
                    this.services = res.data.services;
                    this.loading_services = false;
                })
            }
        },

        formatPrice(value) {
			let val = (value/1).toFixed(2).replace('.,', '.')
			return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        },

        async getAccounts(){
            if(this.bill_id){
                await this.$axios.get('/api/accounts-list')
                .then(res => {
                    this.accounts = res.data.accounts;
                    this.paying_methods = res.data.paying_methods;
                })
            }
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
        
        Free(){

        },

        Cancel(){

        },

        Delete: function(index){
            if(this.bill_id){

            }
            else{
                // const service = this.services[index];
                this.services.splice(index, 1);
            }
        }, 

        async Income(){
            if(this.bill_id){
                this.income_loading = true;
                await this.$axios.post('/api/account-statement/income', {customer_id:this.customer_id, comment:this.paying_comments, date_payed:this.date_payed, cheque:this.check, movimiento:this.movement, deposit:this.ammount, tax_percent:this.tax_percent, has_tax:this.has_tax, paying_method_id:this.paying_method_id, account_id:this.account_id})
                .then(res => {
                    this.customers_balance = res.data;
                    if(res.data >= this.balance){
                        this.bill_pending = this.balance;
                        this.ammount = 0;
                    }
                    else{
                        this.bill_pending = res.data;
                        this.ammount = this.balance - res.data;
                    }
                    this.paying_comments = '';
                    this.check = '';
                    this.movimiento = '';
                    // this.ammount = 0;
                    this.paying_method_id = '';
                    this.account_id = '';
                    this.date_payed = new Date().toISOString().substr(0, 10);
                    this.snackbar = true;
                    this.snackColor = 'success';
                    this.snackText = 'Se generó el ingreso exitosamente';
                    this.timeout = 2000;
                    this.errors = {};
                    this.income_loading = false;
                })
                .catch(error => {
                    this.errors = error.response.data.errors;
                    this.snackbar = true;
                    this.snackColor = 'error';
                    this.snackText = 'NO se pudo capturar el ingreso, revise los errores en el formulario';
                    this.timeout = 2000;
                    this.income_loading = false;
                })
            }
        }, 

        PayLoad(){
            if(this.bill_id){
                this.pay_load = true;
                if(this.bill_pending <= this.balance && this.bill_pending <= this.customers_balance){
                    this.PayBill();
                }
                else if(this.bill_pending <= this.balance && this.bill_pending > this.customers_balance){
                    this.paying_alert = true;
                    this.bill_pending = this.customers_balance;
                }
                else if(this.bill_pending > this.balance){
                    this.snackbar = true;
                    this.snackColor = 'error';
                    this.snackText = 'NO se pudo pagar la factura, revise los errores en el formulario';
                    this.errors.bill_pending = 'El monto a pagar no puede ser mayor al monto pendiente de la factura';
                    this.timeout = 2000;
                    this.pay_load = false;
                }
            }
        },

        ContinuePayment(){
            this.PayBill();
            this.paying_alert = false;
        },

        CancelPayment(){
            this.paying_alert = false;
            this.pay_load = false;
        },

        async PayBill(){
            await this.$axios.put(`/api/bills/paybill/${this.bill_id}`, {ammount:this.bill_pending, balance:this.balance, date_payed:this.date_payed, payed_ammount:this.payed_ammount, total:this.total, customer_id:this.customer_id})
            .then(res => {
                if(this.from_bill == 1){
                    this.$emit('updateServices');
                }
                else if(this.from_bill == 2 || this.from_bill == 3){
                    this.$emit('updateBill', res.data);
                }
                this.customers_balance = res.data.customer_balance;
                this.balance = res.data.balance;
                this.bill_pending = res.data.balance;
                this.payed_ammount = res.data.payed_ammount;
                this.snackbar = true;
                this.snackColor = 'success';
                this.snackText = 'Se pagó la factura exitosamente';
                this.timeout = 2000;
                this.errors = {};
                this.pay_load = false;
            })
            .catch(error => {
                this.errors = error.response.data.errors;
                this.snackbar = true;
                this.snackColor = 'error';
                this.snackText = 'NO se pudo pagar la factura, revise los errores en el formulario';
                this.timeout = 2000;
                this.pay_load = false;
            })
        }
    }
}
</script>