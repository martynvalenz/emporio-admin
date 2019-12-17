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
								<v-col cols="12" sm="12" md="6" lg="6" xl="6" v-if="type <= 3">
                                    <v-autocomplete v-model="provider" v-if="!new_provider && !provider_edit" :items="providers" outlined :loading="providerLoading" :search-input.sync="sync_provider" hide-no-data hide-selected item-text="provider" item-value="id" placeholder="Buscar proveedor..." return-object :error-messages="errors.provider_id" label="Proveedor" append-icon="clear" @click:append="clearProvider" append-outer-icon="add" @click:append-outer="addProvider"></v-autocomplete>
                                    <v-text-field v-if="new_provider && type <= 3 && !provider_edit" outlined v-model="provider_name" :readonly="!new_provider" prepend-icon="close" @click:prepend="clearProvider" append-icon="save" @click:append="saveProvider" label="Agregar Proveedor" :error-messages="errors.provider" :loading="providerLoading"></v-text-field>
                                    <v-text-field v-model="provider" v-if="provider_edit" outlined  label="Proveedor" append-icon="edit" @click:append="provider_edit = false"></v-text-field>
								</v-col>
                                <v-col cols="12" xs="12" sm="12" md="8" lg="6" xl="6" v-if="type == 6 || type == 9">
                                    <v-select v-model="employee_id" :items="employees" item-value="id" item-text="employee" outlined clearable append-outer-icon="sync" @click:append-outer="getEmployees" label="Seleccionar usuario"></v-select>
                                </v-col>
                                <v-col cols="12" sm="12" md="3" lg="3" xl="3">
                                    <v-select v-model="type" :items="types" item-value="value" item-text="text" color="primary" outlined label="Tipo de Egreso *" :error-messages="errors.type" @change="setType"></v-select>
								</v-col>
                                <v-col cols="12" sm="12" md="3" lg="3" xl="3" v-if="type == 5">
                                    <v-menu v-model="date_menu_ini" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y full-width min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="date_ini" label="Fecha inicial *" append-icon="event" outlined readonly v-on="on" @click:append="date_menu_ini = true" :error-messages="errors.date_ini"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="date_ini" locale="es" color="light-blue darken-3" @input="date_menu_ini = false"></v-date-picker>
                                    </v-menu>
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

                            <v-row v-if="type === 4">
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-select v-model="received_account_id" outlined label="Cuenta Receptora *" :items="accounts" item-value="id" item-text="alias" append-icon="close" @click:append="received_account_id = ''" :error-messages="errors.received_account_id"></v-select>
                                </v-col>
                            </v-row>

                            <v-row v-if="type == 1">
								<v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                    <v-checkbox v-model="service_payments" label="Aplicar egreso a servicio" color="primary"></v-checkbox>
								</v-col>
							</v-row>
                            <v-row v-if="type == 1">
                                <v-col cols="12" xs="12">
                                    <v-autocomplete v-model="service" v-if="service_payments" :items="services" outlined :loading="serviceLoading" :search-input.sync="sync_service" hide-no-data hide-selected item-text="service" item-value="id" placeholder="Buscar servicio..." return-object :error-messages="errors.service_id" label="Servicio" append-icon="clear" @click:append="clearService"></v-autocomplete>
                                </v-col>
                            </v-row>
                            <hr>

                            <v-row>
                                <v-col cols="12" sm="12" md="6" lg="2" v-if="!employee">
                                    <v-checkbox v-model="has_tax" color="primary" label="Con IVA"></v-checkbox>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="2">
                                    <v-text-field v-model="tax_percent" filled color="primary" label="%IVA" type="number" step="any" min="0" readonly></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="2" v-if="type < 5 || type > 6">
                                    <v-text-field v-model="withdraw" outlined color="primary" label="Monto *" type="number" step="any" min="0"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="2" v-else>
                                    <v-text-field v-model="total_wage" readonly filled color="primary" label="Monto *" type="number" step="any" min="0"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-text-field v-model="cheque" outlined color="primary" label="Cheque"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="3">
                                    <v-text-field v-model="movimiento" outlined color="primary" label="Movimiento"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row v-if="type == 5">
                                <v-col cols="12" xs="12">
                                    <v-card class="elevation-1" :loading="loading_wage">
                                        <v-card-title>
                                            <h4>Empleados</h4>
                                            <v-spacer></v-spacer>
                                            <v-btn fab icon @click="getEmployees"><v-icon>sync</v-icon></v-btn>
                                        </v-card-title>
                                        <v-card-title v-if="errors.employees_length">
                                            <v-alert text prominent type="error" icon="mdi-cloud-alert">{{errors.employees_length}}</v-alert>
                                        </v-card-title>
                                        <v-card-text>
                                            <v-simple-table class="elevation-4" >
                                                <thead>
                                                    <tr>
                                                        <th class="text-left" style="width:25%;">Usuario</th>
                                                        <th class="text-right" style="width:15%; color:red;">IMSS</th>
                                                        <th class="text-right" style="width:15%; color:red;">Préstamos</th>
                                                        <th class="text-right" style="width:15%; color:red;">Error en cobro</th>
                                                        <th class="text-right" style="width:15%; color:green;">Monto</th>
                                                        <th style="width:15%;"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="(employee, index) in employees_wage" :key="index">
                                                        <td>{{employee.initials}} - {{employee.name}} {{employee.last_name}}</td>
                                                        <td class="text-right">
                                                            <v-edit-dialog :return-value.sync="employee.imss" large persistent>
                                                                <div>{{ employee.imss }}</div>
                                                                <template v-slot:input>
                                                                    <v-text-field v-model="employee.imss" label="Editar monto" single-line autofocus type="number" step="any"></v-text-field>
                                                                </template>
                                                            </v-edit-dialog>
                                                        </td>
                                                        <td class="text-right">
                                                            <v-edit-dialog :return-value.sync="employee.loan" large persistent>
                                                                <div>{{ employee.loan }}</div>
                                                                <template v-slot:input>
                                                                    <v-text-field v-model="employee.loan" label="Editar monto" single-line autofocus type="number" step="any"></v-text-field>
                                                                </template>
                                                            </v-edit-dialog>
                                                        </td>
                                                        <td class="text-right">
                                                            <v-edit-dialog :return-value.sync="employee.errors" large persistent>
                                                                <div>{{ employee.errors }}</div>
                                                                <template v-slot:input>
                                                                    <v-text-field v-model="employee.errors" label="Editar monto" single-line autofocus type="number" step="any"></v-text-field>
                                                                </template>
                                                            </v-edit-dialog>
                                                        </td>
                                                        <td class="text-right">
                                                            <v-edit-dialog :return-value.sync="employee.biweekly_salary" large persistent>
                                                                <div>{{ employee.biweekly_salary }}</div>
                                                                <template v-slot:input>
                                                                    <v-text-field v-model="employee.biweekly_salary" label="Editar monto" single-line autofocus type="number" step="any"></v-text-field>
                                                                </template>
                                                            </v-edit-dialog>
                                                        </td>
                                                        
                                                        <td class="text-right">
                                                            <v-btn fab dark x-small color="green" v-if="expense_id">
                                                                <v-icon>save</v-icon>
                                                            </v-btn>
                                                            <v-btn fab dark x-small color="error">
                                                                <v-icon @click="Delete(index)">close</v-icon>
                                                            </v-btn>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td colspan="1"></td>
                                                        <td class="text-right"><h4>$ {{formatPrice(imss_total)}}</h4></td>
                                                        <td class="text-right"><h4>$ {{formatPrice(loans_total)}}</h4></td>
                                                        <td class="text-right"><h4>$ {{formatPrice(billing_errors_total)}}</h4></td>
                                                        <td class="text-right"><h4>$ {{formatPrice(withdraw_total)}}</h4></td>
                                                        <td class="text-right"><h4>$ {{formatPrice(total_wage)}}</h4></td>
                                                    </tr>
                                                </tfoot>
                                            </v-simple-table>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                            </v-row>
                            <!-- <v-row v-if="type == 6">
                                <v-col cols="12" xs="12">
                                    <v-card class="elevation-1" :loading="loading_wage">
                                        <v-card-title>
                                            <h4>Empleados</h4>
                                            <v-spacer></v-spacer>
                                            <v-btn fab icon @click="getEmployees"><v-icon>sync</v-icon></v-btn>
                                        </v-card-title>
                                        <v-card-title v-if="errors.employees_length">
                                            <v-alert text prominent type="error" icon="mdi-cloud-alert">{{errors.employees_length}}</v-alert>
                                        </v-card-title>
                                        <v-card-text>
                                            <v-simple-table class="elevation-4" >
                                                <thead>
                                                    <tr>
                                                        <th class="text-left" style="width:25%;">Usuario</th>
                                                        <th class="text-right" style="width:15%; color:red;">IMSS</th>
                                                        <th class="text-right" style="width:15%; color:red;">Préstamos</th>
                                                        <th class="text-right" style="width:15%; color:red;">Error en cobro</th>
                                                        <th class="text-right" style="width:15%; color:green;">Monto</th>
                                                        <th style="width:15%;"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="(service, index) in comissions" :key="index">
                                                        <td>{{employee.initials}} - {{employee.name}} {{employee.last_name}}</td>
                                                        <td class="text-right">
                                                            <v-edit-dialog :return-value.sync="employee.imss" large persistent>
                                                                <div>{{ employee.imss }}</div>
                                                                <template v-slot:input>
                                                                    <v-text-field v-model="employee.imss" label="Editar monto" single-line autofocus type="number" step="any"></v-text-field>
                                                                </template>
                                                            </v-edit-dialog>
                                                        </td>
                                                        <td class="text-right">
                                                            <v-edit-dialog :return-value.sync="employee.loan" large persistent>
                                                                <div>{{ employee.loan }}</div>
                                                                <template v-slot:input>
                                                                    <v-text-field v-model="employee.loan" label="Editar monto" single-line autofocus type="number" step="any"></v-text-field>
                                                                </template>
                                                            </v-edit-dialog>
                                                        </td>
                                                        <td class="text-right">
                                                            <v-edit-dialog :return-value.sync="employee.errors" large persistent>
                                                                <div>{{ employee.errors }}</div>
                                                                <template v-slot:input>
                                                                    <v-text-field v-model="employee.errors" label="Editar monto" single-line autofocus type="number" step="any"></v-text-field>
                                                                </template>
                                                            </v-edit-dialog>
                                                        </td>
                                                        <td class="text-right">
                                                            <v-edit-dialog :return-value.sync="employee.biweekly_salary" large persistent>
                                                                <div>{{ employee.biweekly_salary }}</div>
                                                                <template v-slot:input>
                                                                    <v-text-field v-model="employee.biweekly_salary" label="Editar monto" single-line autofocus type="number" step="any"></v-text-field>
                                                                </template>
                                                            </v-edit-dialog>
                                                        </td>
                                                        
                                                        <td class="text-right">
                                                            <v-btn fab dark x-small color="green" v-if="expense_id">
                                                                <v-icon>save</v-icon>
                                                            </v-btn>
                                                            <v-btn fab dark x-small color="error">
                                                                <v-icon @click="Delete(index)">close</v-icon>
                                                            </v-btn>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td colspan="1"></td>
                                                        <td class="text-right"><h4>$ {{formatPrice(imss_total)}}</h4></td>
                                                        <td class="text-right"><h4>$ {{formatPrice(loans_total)}}</h4></td>
                                                        <td class="text-right"><h4>$ {{formatPrice(billing_errors_total)}}</h4></td>
                                                        <td class="text-right"><h4>$ {{formatPrice(withdraw_total)}}</h4></td>
                                                        <td class="text-right"><h4>$ {{formatPrice(total_wage)}}</h4></td>
                                                    </tr>
                                                </tfoot>
                                            </v-simple-table>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                            </v-row> -->
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
            expense_id:'',
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
            provider_edit:false,
            //Servicios
            service_id:'',
            services:[],
            service:'',
            serviceLoading:false,
            sync_service:'',
            brand_id:'',
            service_payments:0,
            service_payment_id:'',
            //Form
            errors:[],
            loading:false,
            date_menu:false,
            date:new Date().toISOString().substr(0, 10),
            account_id:'',
            received_account_id:'',
            received_expense_id:'',
            accounts:[],
            paying_method_id:'',
            paying_methods:[],
            comment:'',
            type:'',
            types:[
                {value:1, text:'Despacho'},
                {value:2, text:'Hogar'},
                {value:3, text:'Personal'},
                {value:4, text:'Traspaso'},
                {value:5, text:'Nómina'},
                {value:6, text:'Comisión'},
                // {value:7, text:'Ingreso'},
                // {value:8, text:'Tarjeta de crédito'},
                {value:9, text:'Préstamo'},
                {value:10, text:'Error'},
                {value:11, text:'FEPS'}
            ],
            //withdraws
            tax_percent:0,
            has_tax:0,
            withdraw:0,
            cheque:'',
            movimiento:'',
            //Employees
            employee:false,
            employee_id:'',
            employees:[],
            employees_wage:[],
            comissions:[],
            loading_wage:false,
            date_ini:'',
            date_menu_ini:false,
            //Snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
			timeout: 6000,
        }
    },

    computed: {
        withdraw_total: function(){
            if(this.employees_wage.length > 0){
                return this.employees_wage.reduce(function(total, item){
                    return (total * 1) + (item.biweekly_salary * 1);
                }, 0);
            }
            else{
                return 0;
            }
        },

        imss_total: function(){
            if(this.employees_wage.length > 0){
                return this.employees_wage.reduce(function(total, item){
                    return (total * 1) + (item.imss * 1);
                }, 0);
            }
            else{
                return 0;
            }
        },

        billing_errors_total: function(){
            if(this.employees_wage.length > 0){
                return this.employees_wage.reduce(function(total, item){
                    return (total * 1) + (item.errors * 1);
                }, 0);
            }
            else{
                return 0;
            }
        },

        loans_total: function(){
            if(this.employees_wage.length > 0){
                return this.employees_wage.reduce(function(total, item){
                    return (total * 1) + (item.loan * 1);
                }, 0);
            }
            else{
                return 0;
            }
        },

        total_wage: function(){
            if(this.employees_wage.length > 0){
                return this.employees_wage.reduce(function(total, item){
                    return (total * 1) + (item.biweekly_salary * 1) - (item.loan * 1) - (item.imss * 1) - (item.errors * 1);
                }, 0);
            }
            else{
                return 0;
            }
        },
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

        createSalary(){
            this.expense_dialog = true;
            this.title = 'Crear Nómina';
            this.type = 5;
            this.clearData();
            this.getAccounts();
            this.employee = true;
            this.date_ini = this.user.session.original.biweek1;
            this.date = this.user.session.original.biweek2;
            this.employees = [];
            this.getEmployees();
            this.service_payments = 0;
        },

        createTransfer(){
            this.expense_dialog = true;
            this.title = 'Crear Traspaso entre cuentas';
            this.type = 4;
            this.clearData();
            this.getAccounts();
            this.employee = false;
            this.date = new Date().toISOString().substr(0, 10);
            this.employees = [];
            this.service_payments = 0;
        },

        editExpense(id, type){
            this.expense_dialog = true;
            this.title = 'Editar egreso ' + id;
            this.expense_id = id;
            this.type = type;
            this.errors = {};
            this.getAccounts();
            this.getTax();
            this.getExpenseData();
        },

        async getExpenseData(){
            await this.$axios.get(`/api/account-statement/expense/edit/${this.expense_id}`)
            .then(res => {
                //Provider
                if(res.data.expense.provider_id){
                    this.provider_edit = true;
                    this.provider_id = res.data.expense.provider_id;
                    this.provider = res.data.expense.provider;
                }
                else{
                    this.provider_edit = false;
                    this.provider_id = '';
                    this.provider = '';
                }
                //Servicios
                this.service_payments = res.data.expense.service_payment;
                if(res.data.expense.service_payment == 1){
                    this.service_id = res.data.service_payment.id;
                    this.service = res.data.service_payment.service;
                    this.services = res.data.service_payment.service;
                    this.brand_id = res.data.service_payment.brand_id;
                    this.service_payment_id = res.data.service_payment.service_payment_id;
                }
                //Form
                this.date = res.data.expense.date;
                this.account_id = res.data.expense.account_id;
                this.received_account_id = res.data.expense.received_account_id;
                if(res.data.received){
                    this.received_expense_id = res.data.received.id;
                }
                this.paying_method_id = res.data.expense.paying_method_id;
                this.comment = res.data.expense.comment;
                //withdraws
                // tax_percent:0,
                this.has_tax = res.data.expense.has_tax;
                this.withdraw = res.data.expense.withdraw;
                this.cheque = res.data.expense.cheque;
                this.movimiento = res.data.expense.movimiento;
                //Employees
                // employee:false,
                // employee_id:'',
                // employees:[],
                // employees_wage:[],
                // loading_wage:false,
                this.date_ini = res.data.expense.date_ini;
                if(res.data.wage){
                    this.employees_wage = res.data.wage;
                }
            })
            .catch(error => {
                console.log(error);
            })
        },

        clearDataInit(){
            this.expense_id = '';
            //Servicios
            this.service_id = '';
            this.services = [];
            this.service = '';
            this.serviceLoading = false;
            this.sync_service = '';
            this.brand_id = '';
            this.service_payments = 0;
            this.service_payment_id = '';
            //Provider
            this.provider_id = '';
            this.providers = [];
            this.provider = '';
            this.new_provider = false;
            this.provider_name = '';
            this.providerLoading = false;
            this.sync_provider = '';
            this.provider_edit = false;
            //Form
            this.errors = [];
            this.date = new Date().toISOString().substr(0, 10);
            this.account_id = '';
            this.received_account_id = '';
            this.paying_method_id = '';
            this.comment = '';
            this.type = '';
            //Employees
            this.employee = false;
            this.employee_id = '';
            this.employees = [];
            //withdraws
            this.has_tax = 0;
            this.withdraw = 0;
            this.cheque = '';
            this.movimiento = '';
        },

        clearData(){
            this.expense_id = '';
            //Provider
            this.provider_id = '';
            this.providers = [];
            this.provider = '';
            this.provider_name = '';
            this.service_payments = 0;
            //Servicios
            this.service_id = '';
            this.services = [];
            this.service = '';
            this.serviceLoading = false;
            this.sync_service = '';
            this.brand_id = '';
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
            .catch(error => {
                console.log(error)
                this.providerLoading =false;
            })
        },

        serviceSelect(val){
            this.serviceLoading = true
            this.$axios.post('/api/service-pending', {search:val})
            .then(res => {
                this.services = res.data.data;
                this.service_id = this.service.id;
                this.brand_id = this.service.brand_id;
                this.serviceLoading = false;
            })
        },

        clearProvider(){
            
            if(this.expense_id && this.provider_id){
                this.new_provider = true;
            }
            else{
                this.new_provider = false;
                this.provider_name = '';
                this.providers = [];
                this.provider_id = '';
                this.provider = '';
                this.providerLoading = false;
            }
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

        saveExpense(){
            this.loading = true;
            var formData = {};

            if(this.type == 1 || this.type == 2 || this.type == 3){
                formData = {type:this.type, comment:this.comment, date:this.date, cheque:this.cheque, movimiento:this.movimiento, withdraw:this.withdraw, has_tax:this.has_tax, tax_percent:this.tax_percent, paying_method_id:this.paying_method_id, account_id:this.account_id, provider_id:this.provider_id, service_payments:this.service_payments, service_id:this.service_id, brand_id:this.brand_id, service_payment_id:this.service_payment_id};
            }
            else if(this.type == 4){
                formData = {type:this.type, comment:this.comment, date:this.date, cheque:this.cheque, movimiento:this.movimiento, withdraw:this.withdraw, has_tax:0, tax_percent:this.tax_percent, paying_method_id:this.paying_method_id, account_id:this.account_id, received_account_id:this.received_account_id, received_expense_id:this.received_expense_id};
            }
            else if(this.type == 5){
                formData = {type:this.type, comment:this.comment, date:this.date, date_ini:this.date_ini, cheque:this.cheque, movimiento:this.movimiento, withdraw:this.total_wage, has_tax:0, tax_percent:this.tax_percent, paying_method_id:this.paying_method_id, account_id:this.account_id, employees_length:this.employees_wage.length, employees:this.employees_wage}
            }
            else if(this.type == 6){
                
            }
            else if(this.type == 8){
                
            }
            else if(this.type == 9){
                
            }

            if(this.expense_id){
                this.$axios.put(`/api/account-statement/expense/update/${this.expense_id}`, formData)
                .then(res =>{
                    this.clearData();
                    this.expense_dialog = false;
                    this.snackbar = true;
                    this.snackColor = 'success';
                    this.snackText = 'Se actualizó el registro exitosamente';
                    this.timeout = 2000;
                    this.loading = false;
                    this.$emit('updateExpense', res.data);
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
            else{
                this.$axios.post('/api/account-statement/expense', formData)
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
                    if(error.response.data.success == false){
                        this.snackbar = true;
                        this.snackColor = 'error';
                        this.snackText = error.response.data.msg;
                        this.errors.employees_length = error.response.data.msg;
                        this.timeout = 5000;
                        this.loading = false;
                    }else{
                        this.errors = error.response.data.errors;
                        this.snackbar = true;
                        this.snackColor = 'error';
                        this.snackText = 'No se pudo guardar el registro, revise los errores en el formulario.';
                        this.timeout = 2000;
                        this.loading = false;
                    }
                })
            }
        },

        setType(){
            if(this.type === 1){
                this.employee = false;
                this.employees = [];
                this.employees_wage = [];
                this.service_payments = 0;
                this.date_ini = new Date().toISOString().substr(0, 10);
            }
            else if(this.type === 2){
                this.employee = false;
                this.employees = [];
                this.employees_wage = [];
                this.service_payments = 0;
                this.date_ini = new Date().toISOString().substr(0, 10);
            }
            else if(this.type === 3){
                this.employee = false;
                this.employees = [];
                this.employees_wage = [];
                this.service_payments = 0;
                this.date_ini = new Date().toISOString().substr(0, 10);
            }
            else if(this.type === 5){
                this.employee = true;
                this.date_ini = this.user.session.original.biweek1;
                this.date_ini = this.user.session.original.biweek2;
                this.employees = [];
                if(!this.expense_id){
                    this.getEmployees();
                }
                this.service_payments = 0;
            }
            else if(this.type === 6){
                this.employee = true;
                this.date_ini = this.user.session.original.biweek1;
                this.date_ini = this.user.session.original.biweek2;
                this.employees_wage = [];
                this.getEmployees();
                this.service_payments = 0;
            }
            else if(this.type === 9){
                this.employee = true;
                this.employees_wage = [];
                this.getEmployees();
                this.service_payments = 0;
            }

        },

        async getEmployees(){
            this.errors = {};
            if(this.type == 6 || this.type == 9){
                await this.$axios.post('/api/users-list', {type:this.type})
                .then(res => {
                    this.employees = res.data;
                })
                .catch(error => {
                    console.log(error);
                })
            }
            else if(this.type === 5){
                if(this.expense_id){
                    this.loading_wage = true;
                    await this.$axios.get(`/api/users-wage-edit/${this.expense_id}`)
                    .then(res => {
                        this.loading_wage = false;
                        this.employees_wage = res.data;
                    })
                    .catch(error => {
                        this.loading_wage = false;
                        console.log(error);
                    })
                }
                else{
                    this.loading_wage = true;
                    await this.$axios.get('/api/users-wage')
                    .then(res => {
                        this.loading_wage = false;
                        this.employees_wage = res.data;
                    })
                    .catch(error => {
                        this.loading_wage = false;
                        console.log(error);
                    })
                }
            }
        },

        Delete(index){
            if(this.expense_id){

            }
            else{
                this.employees_wage.splice(index, 1);
            }
        },

        formatPrice(value) {
			let val = (value/1).toFixed(2).replace('.,', '.')
			return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        },
    }
}
</script>

<style>
    
</style>