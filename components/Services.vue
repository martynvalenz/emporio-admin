<template>
    <div>
        <v-dialog v-model="service_dialog" fullscreen transition="dialog-bottom-transition" scrollable>
			<v-form>
				<v-card>
                    <v-system-bar color="primary" dark height="60px;">
                        <h2>{{title}}</h2>
                        <v-spacer></v-spacer>
                        <v-btn icon small @click="service_dialog = false"><v-icon color="white">close</v-icon></v-btn>
                    </v-system-bar>
					<v-card-text class="mb-4">
						<v-container fluid>
							<v-row>
								<v-col cols="12" sm="12" md="7" lg="6">
									<v-autocomplete v-if="!service_id" v-model="customer" :items="customers" outlined :loading="customerLoading" :search-input.sync="sync_customer" hide-no-data hide-selected item-text="customer" item-value="id" placeholder="Buscar cliente..." return-object :error-messages="errors.customer_id" label="Cliente" append-icon="clear" @click:append="ClearCustomer" append-outer-icon="sync" @click:append-outer="getCustomerData"></v-autocomplete>
                                    <v-text-field v-if="service_id" v-model="customer" outlined label="Cliente" readonly></v-text-field>
								</v-col>
                                <v-spacer></v-spacer>
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
                                <v-col cols="12" sm="12" md="10" lg="10">
                                    <v-select v-if="!newBrand" v-model="brand_id" outlined :items="brands" item-value="id" item-text="brand" label="Seleccionar nombre de Servicio" :error-messages="errors.brand_id" prepend-icon="add" @click:prepend="newBrand = true" clearable></v-select>
                                    <v-text-field v-else v-model="brand" prepend-icon="close" @click:prepend="newBrand = false" append-icon="save" @click:append="saveBrand" outlined label="Crear nombre de Servicio" :error-messages="errors.brand"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="2" lg="2">
                                    <v-select v-model="class_id" outlined :items="classes" item-value="id" item-text="class" label="Clase" :error-messages="errors.class_id" clearable append-outer-icon="help_outline" @click:append-outer="showClass"></v-select>
                                </v-col>
                            </v-row>
                            <v-row v-if="related.length > 0">
                                <v-col cols="12" xs="12">
                                    <v-simple-table class="elevation-4">
                                        <thead>
                                            <tr>
                                                <th class="text-left" style="width:15%">Fecha</th>
                                                <th class="text-left" style="width:40%">Servicio</th>
                                                <th class="text-right" style="width:20%">Precio</th>
                                                <th class="text-center" style="width:15%">Resp</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(service, index) in related" :key="index">
                                                <td title="service.id">{{ service.date }}</td>
                                                <td>{{ service.code }} - {{ service.brand }}<span v-if="service.class"> {{service.class}}</span></td>
                                                <td class="text-right">$ {{ formatPrice(service.final_price) }}</td>
                                                <td class="text-center">{{ service.resp }}</td>
                                            </tr>
                                        </tbody>
                                    </v-simple-table>
                                </v-col>
                            </v-row>
                            <br v-if="related.length > 0">
							<v-row>
								<v-col cols="12" sm="12" md="10" lg="10">
                                    <v-autocomplete v-if="service_select" v-model="service" :items="services" outlined :loading="serviceLoading" :search-input.sync="sync_service" hide-no-data hide-selected item-text="service" item-value="id" placeholder="Buscar servicio contratado..." return-object :error-messages="errors.services_catalog_id" label="Servicio contratado" append-outer-icon="refresh" append-icon="clear" @click:append="ClearData" @click:append-outer="getServiceData"></v-autocomplete>
                                    <v-text-field v-if="!service_select" v-model="service" outlined label="Servicio" readonly append-icon="edit" @click:append="service_select = true"></v-text-field>
                                </v-col>
							</v-row>
                            <v-row>
                                <v-col cols="12" sm="12" md="3" lg="3">
                                    <v-select v-model="responsable_id" outlined :items="responsables" item-value="id" item-text="user" label="Seleccionar Responsable" :error-messages="errors.responsable_id" clearable></v-select>
                                </v-col>
                                <v-col cols="12" sm="12" md="3" lg="3">
                                    <v-select v-model="binnacle_id" outlined :items="binnacles" item-value="id" item-text="binnacle" label="Seleccionar Bitácora" :error-messages="errors.binnacle_id" clearable></v-select>
                                </v-col>
                                <v-col cols="12" sm="12" md="3" lg="3">
                                    <v-select v-model="status_category_id" outlined :items="status_categories" item-value="id" item-text="category" label="Seleccionar Estatus" :error-messages="errors.status_category_id" clearable @change="getSubcategories"></v-select>
                                </v-col>
                                <v-col cols="12" sm="12" md="3" lg="3">
                                    <v-select v-model="status_subcategory_id" outlined :items="status_subcategories" item-value="id" item-text="subcategory" label="Seleccionar Subcategoría" :error-messages="errors.status_subcategory_id" clearable></v-select>
                                </v-col>
                            </v-row>
                            <hr>
                            <br>
                            <v-row>
                                <v-col cols="12" sm="6" md="3" lg="2">
                                    <v-select v-model="coin_id" :items="coins" item-value="id" item-text="coin" outlined label="Moneda" @change="changeCoin"></v-select>
                                </v-col>
                                <v-col cols="12" sm="6" md="3" lg="2">
                                    <v-text-field v-model="price_desc" filled label="Precio base" readonly></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="3" lg="2">
                                    <v-text-field v-model="cost" type="number" step="any" outlined label="Pago de Derechos" append-icon="refresh" :error-messages="errors.cost" v-on:keyup="editCost" @click:append="editCost"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="3" lg="2">
                                    <v-text-field v-model="external_fee" type="number" step="any" outlined label="Pago de Honorarios" :error-messages="errors.external_fee" v-on:keyup="editCost"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="3" lg="2">
                                    <v-text-field v-model="extra_cost" type="number" step="any" outlined label="Costos Extra" append-icon="add" @click:append="addExtraCosts"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="6" md="3" lg="2">
                                    <v-text-field v-if="coin_id == 1" v-model="conversion" readonly outlined label="Tipo de Cambio"></v-text-field>
                                    <v-text-field v-else v-model="conversion" type="number" step="any" outlined label="Tipo de Cambio" append-icon="done_outline" :error-messages="errors.conversion" @click:append="editConversion"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="3" lg="2">
                                    <v-text-field v-model="discount" type="number" step="any" outlined label="Descuento" append-icon="refresh" @click:append="editDiscount" :error-messages="errors.discount" v-on:keyup="editDiscount"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="3" lg="2">
                                    <v-text-field v-model="discount_percent" type="number" step="any" outlined label="%Descuento" append-icon="refresh" @click:append="editPercentDiscount" :error-messages="errors.discount_percent" v-on:keyup="editPercentDiscount"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="3" lg="2">
                                    <v-text-field v-model="final_price" type="number" step="any" outlined label="Precio sin IVA*" append-icon="refresh" :error-messages="errors.final_price" @click:append="FinalCut" v-on:keyup="FinalCut"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row v-if="show_related">
                                <v-col cols="12" xs="12" sm="12" md="7" lg="5" xl="5">
                                    <v-select v-model="select_related" outlined label="Seleccionar servicio extra" :items="related_services" item-value="id" item-text="service"  append-icon="clear" @click:append="select_related = ''" :error-messages="errors.select_related"></v-select>
                                </v-col>
                                <v-col cols="12" xs="12" sm="12" md="3" lg="2" xl="2">
                                    <v-text-field v-model="related_ammount" type="number" step="any" min="0" outlined label="Monto de honorarios" :error-messages="errors.related_ammount" append-outer-icon="close" @click:append-outer="closeRelated"></v-text-field>
                                </v-col>
                            </v-row>
                            <hr>
                            <br>
                            <v-row>
                                <v-col cols="12" xs="12">
                                    <h3>Comisiones <v-btn icon @click="updateComissions"><v-icon>refresh</v-icon></v-btn></h3>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" xs="12" md="12" lg="5">
                                    <v-simple-table class="elevation-3">
                                        <thead>
                                            <tr>
                                                <th>Concepto</th>
                                                <th class="text-right">Porcentaje</th>
                                                <th class="text-right">Monto</th>
                                                <th>Aplica?</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Venta</td>
                                                <td class="text-right">% {{sales_comission}}</td>
                                                <td class="text-right">$ {{sales_value}}</td>
                                                <td>
                                                    <v-checkbox @change="updateComissions" color="primary" v-model="sales_check" false-value="0" true-value="1"></v-checkbox>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Operativa</td>
                                                <td class="text-right">% {{operations_comission}}</td>
                                                <td class="text-right">$ {{operations_value}}</td>
                                                <td>
                                                    <v-checkbox color="primary" v-model="operations_check" false-value="0" true-value="1"></v-checkbox>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Gestión</td>
                                                <td class="text-right">% {{management_comission}}</td>
                                                <td class="text-right">$ {{management_value}}</td>
                                                <td>
                                                    <v-checkbox color="primary" v-model="management_check" @change="updateComissions" false-value="0" true-value="1"></v-checkbox>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-simple-table>
                                </v-col>
                            </v-row>
                            <v-row>
								<v-col cols="12" sm="12" md="12" lg="12">
                                    <v-textarea v-model="comment" label="Comentarios (opcional)" outlined solo></v-textarea>
                                </v-col>
							</v-row>
                            <v-row>
								<v-btn large color="success" :loading="loading" @click="SaveService">Guardar<v-icon right>save</v-icon></v-btn>
							</v-row>
                            <br>
                            <div class="pt-4"></div>
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
            title:'',
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
            service_select:true,
            services_catalog_id:'',
            //Package
            package_id:'',
            has_package:false,
            package_total:0,
            //Data
            brand_id:'',
            brands:[],
            brand:'',
            newBrand:false,
            classes:[],
            class_id:'',
            comment:'',
            coins:'',
            coin_id:'',
            cost:0,
            external_fee:0,
            extra_cost:0,
            price:0,
            price_desc:'',
            conversion:0,
            conversion_base:0,
            service_discount:0,
            discount:0,
            discount_percent:0,
            final_price:0,
            const_price:0,
            fee:0,
            total_advance:0,
            status_category_id:'',
            status_subcategory_id:'',
            status_categories:[],
            status_subcategories:[],
            //Related services
            show_related:false,
            related:[],
            select_related:'',
            related_services:[],
            related_ammount:0,
            //Comisions
            sales_comission:0,
            management_comission:0,
            operations_comission:0,
            sales_id:'',
            sales:0,
            sales_force:0,
            management_id:'',
            management:0,
            operations:0,
            sales_value:0,
            management_value:0,
            operations_id:'',
            operations_value:0,
            sales_check:true,
            management_check:false,
            operations_check:true,
            //lists
            binnacles:[],
            binnacle_id:'',
            responsables:[],
            responsable_id:'',
            process:[],

            loading: false,
            date: new Date().toISOString().substr(0, 10),
            date_menu:false,
            servicesCollection:[],
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
				this.services_catalog_id = '';
				this.service = null;
			}
		}
	},

    methods:{
        addService()
        {
            this.service_dialog = true;
            this.has_package = false;
            this.package_total = 0;
            this.related = {};
            this.title = 'Agregar Servicio';
            this.getClasses();
            this.getBinnacles();
            this.getResponsables();
            this.getCoins();
            this.getEstatus();
            this.ClearService();
            this.ClearData();
        },

        addPackage()
        {
            this.service_dialog = true;
            this.has_package = true;
            this.package_total = 0;
            this.title = 'Agregar Servicios';
            this.related = {};
            this.getClasses();
            this.getBinnacles();
            this.getResponsables();
            this.getCoins();
            this.getEstatus();
            this.ClearService();
            this.ClearData();
        },

        editService(service_id){
            this.service_dialog = true;
            this.service_select = false;
            this.has_package = true;
            this.title = 'Editar Servicio: #' + service_id;
            this.service_id = service_id;
            this.getClasses();
            this.getBinnacles();
            this.getResponsables();
            this.getCoins();
            this.getEstatus();
            this.$axios.get(`/api/service/edit/${service_id}`)
            .then(res =>{
                this.customer_id = res.data.service.customer_id;
                this.customer = res.data.service.customer;
                this.date = res.data.service.date;
                this.getBrands();
                if(res.data.service.brand_id){
                    this.brand_id = res.data.service.brand_id * 1;
                }
                else{
                    this.brand_id = '';
                }
                if(res.data.service.class_id){
                    this.class_id = res.data.service.class_id * 1;
                }
                else{
                    this.class_id = '';
                }
                this.services_catalog_id = res.data.service.services_catalog_id;
                this.service = res.data.service.service;
                if(res.data.service.responsable_id){
                    this.responsable_id = res.data.service.responsable_id * 1;
                }
                else{
                    this.responsable_id = '';
                }
                if(res.data.service.binnacle_id){
                    this.binnacle_id = res.data.service.binnacle_id * 1;
                }
                else{
                    this.binnacle_id = '';
                }
                if(res.data.service.status_category_id){
                    this.status_category_id = res.data.service.status_category_id * 1;
                }
                else{
                    this.status_category_id = '';
                }
                if(res.data.service.status_subcategory_id){
                    this.status_subcategory_id = res.data.service.status_subcategory_id * 1;
                }
                else{
                    this.status_subcategory_id = '';
                }
                this.coin_id = res.data.service.money_exchange_id * 1;
                this.price_desc = res.data.service.price_desc;
                this.cost = res.data.service.cost;
                this.extra_cost = 0;
                this.external_fee = res.data.service.external_fee;
                this.conversion = res.data.service.money_exchange;
                this.discount = res.data.service.discount;
                this.discount_percent = res.data.service.discount_percent;
                this.final_price = res.data.service.final_price;
                this.comment = res.data.service.comment;
                this.show_related = false;
                this.related = [];
                this.select_related = '';
                this.related_services = [];
                this.related_ammount = 0;
                //Comissions
                if(res.data.sales_comission){
                    this.sales_id = res.data.sales_comission.id;
                    this.sales_comission = res.data.sales_comission.comission_percent;
                    this.sales_value = res.data.sales_comission.comission;
                    this.sales_check = '1';
                }
                else{
                    this.sales_id = '';
                    this.sales_comission = 0;
                    this.sales_value = 0;
                    this.sales_check = '0';
                }

                if(res.data.operations_comission){
                    this.operations_id = res.data.operations_comission.id;
                    this.operations_comission = res.data.operations_comission.comission_percent;
                    this.operations_value = res.data.operations_comission.comission;
                    this.operations_check = '1';
                }
                else{
                    this.operations_id = '';
                    this.operations_comission = 0;
                    this.operations_value = 0;
                    this.operations_check = '0';
                }

                if(res.data.management_comission){
                    this.management_id = res.data.management_comission.id;
                    this.management_comission = res.data.management_comission.comission_percent;
                    this.management_value = res.data.management_comission.comission;
                    this.management_check = '1';
                }
                else{
                    this.management_id = '';
                    this.management_comission = 0;
                    this.management_value = 0;
                    this.management_check = '0';
                }
                
            })
            .catch(error => {
                console.log(error);
            })
        },
        
        customerSelect(val){
			this.customerLoading = true;
			this.$axios.post('/api/service/customers', {search:val})
			.then(res => {
				this.customers = res.data.data;
                this.customer_id = this.customer.id;
                this.getBrands();
                this.getPendingServices();
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
            this.related = {};
        },

        serviceSelect(val){
			this.serviceLoading = true;
			this.$axios.post('/api/services/list', {search:val})
			.then(res => {
				this.services = res.data;
                this.services_catalog_id = this.service.id;
                this.getServiceData();
                this.getRequirements();
                this.serviceLoading = false;
                this.errors = {};
			})
			.catch(error => {
				console.log(error);
				this.serviceLoading = false;
			})
        },

        getCustomerData(){
            this.getBrands();
            this.getPendingServices();
        },

        async getBrands(){
            if(this.customer_id){
                await this.$axios.post('/api/service/customer-brands', {customer_id:this.customer_id})
                .then(res => {
                    this.brands = res.data;
                })
                .catch(error => {
                    this.errors = error.response.data.errors;
                })
            }
        },

        async getPendingServices(){
            if(this.customer_id){
                await this.$axios.get(`/api/customer/pending-services/${this.customer_id}`)
                .then(res => {
                    this.related = res.data;
                })
            }
        },

        changeCoin(){
            let coin = this.coins[this.coin_id -1];
            this.conversion = coin.conversion;
            this.editConversion();
        },

        updateComissions(){
            if(!this.service_id){
                if(this.management_comission){
                    if(this.management == 0){
                        this.management_comission = this.management_comission;
                        this.management_value = Math.round((this.management_comission * this.fee) / 100);
                    }
                    else{
                        this.management_value = this.management_comission * conversion;
                        this.management_comission = Math.round((this.management_value / this.fee) * 100);
                    }
                }

                if(this.sales_comission){
                    if(this.sales == 0){
                        this.sales_comission = this.sales_force;
                        this.sales_value = Math.round((this.sales_comission * this.fee) / 100);
                    }
                    else{
                        this.sales_value = this.sales_force * conversion;
                        this.sales_comission = Math.round((this.sales_value / this.fee) * 100);
                    }
                }

                if(this.operations_comission){
                    if(this.operations == 0){
                        this.operations_comission = this.operations_comission;
                        this.operations_value = Math.round((this.operations_comission * this.fee) / 100);
                    }
                    else{
                        this.operations_value = this.operations_comission * conversion;
                        this.operations_comission = Math.round((this.operations_comission / this.fee) * 100);
                    }
                }

                if(this.management_check){
                    if(this.sales_value == 0){
                        
                    }
                    else if(this.management_value == 0)
                    {
                        
                    }
                    else if(this.sales_value < this.management_value){
                        this.sales_value = 0;
                        this.sales_comission = 0;
                    }
                    else{
                        this.sales_value = this.sales_value - this.management_value;
                        this.sales_comission = Math.round(((this.sales_value / this.fee) * 100) * 100) / 100;
                    }
                }
            }
            else{
                
            }
        },

        async getServiceData(){
            if(this.services_catalog_id){
                await this.$axios.post('/api/services/data', {id:this.services_catalog_id, customer_id:this.customer_id})
                .then(res => {
                    this.errors = {};
                    const conversion = res.data.service.conversion;
                    //General Data
                    if(res.data.service.binnacle_id){
                        this.binnacle_id = res.data.service.binnacle_id * 1;
                    }
                    else{
                        this.binnacle_id = '';
                    }
                    if(res.data.service.status_category_id){
                        this.status_category_id = res.data.service.status_category_id * 1;
                    }
                    else{
                        this.status_category_id = '';
                    }
                    this.coin_id = res.data.service.money_exchange_id * 1;
                    this.total_advance = res.data.service.total_advance;
                    this.price_desc = res.data.service.price + ' ' + res.data.service.code;
                    this.price = res.data.service.price;
                    if(this.status_category_id){
                        this.getSubcategories();
                        if(res.data.service.status_subcategory_id){
                        this.status_subcategory_id = res.data.service.status_subcategory_id * 1;
                        }
                        else{
                            this.status_subcategory_id = '';
                        }
                    }

                    //Discounts
                    const discount = (res.data.service.price * conversion) * ((res.data.discount * conversion) / 100);
                    this.discount_percent = res.data.discount;
                    this.discount = Math.round(discount * 100) / 100;

                    //Totals
                    this.external_fee = Math.round((res.data.service.external_fee * conversion) * 100) / 100;
                    this.conversion = conversion;
                    this.conversion_base = conversion;
                    this.cost = res.data.service.cost * conversion;
                    this.final_price = Math.round(((res.data.service.price * conversion) - discount) * 100) / 100;
                    this.const_price = Math.round(((res.data.service.price * conversion) - discount) * 100) / 100;
                    this.fee = Math.round(((res.data.service.price * conversion) - (res.data.service.cost * conversion) - (res.data.service.external_fee * conversion) - discount) * 100)/100;

                    //Comissions
                    this.sales = res.data.service.sales;
                    this.management = res.data.service.management;
                    this.operations = res.data.service.operations;

                    if(res.data.service.management_comission){
                        if(res.data.service.management == 0){
                            this.management_comission = res.data.service.management_comission;
                            this.management_value = Math.round((res.data.service.management_comission * this.fee) / 100);
                        }
                        else{
                            this.management_value = res.data.service.management_comission * conversion;
                            this.management_comission = Math.round((this.management_value / this.fee) * 100);
                        }
                    }

                    if(res.data.service.sales_comission){
                        if(res.data.service.sales == 0){
                            this.sales_comission = res.data.service.sales_comission;
                            this.sales_force = res.data.service.sales_comission;
                            this.sales_value = Math.round((res.data.service.sales_comission * this.fee) / 100);
                        }
                        else{
                            this.sales_value = res.data.service.sales_comission * conversion;
                            this.sales_force = res.data.service.sales_comission * conversion;
                            this.sales_comission = Math.round((this.sales_value / this.fee) * 100);
                        }
                    }

                    if(res.data.service.operations_comission){
                        if(res.data.service.operations == 0){
                            this.operations_comission = res.data.service.operations_comission;
                            this.operations_value = Math.round((res.data.service.operations_comission * this.fee) / 100);
                        }
                        else{
                            this.operations_value = this.operations_comission * conversion;
                            this.operations_comission = Math.round((this.operations_comission / this.fee) * 100);
                        }
                    }

                    if(this.management_check){
                        if(this.sales_value == 0){
                            
                        }
                        else if(this.management_value == 0)
                        {
                            
                        }
                        else if(this.sales_value < this.management_value){
                            this.sales_value = 0;
                            this.sales_comission = 0;
                        }
                        else{
                            this.sales_value = this.sales_value - this.management_value;
                            this.sales_comission = Math.round(((this.sales_value / this.fee) * 100) * 100) / 100;
                        }
                    }
                })
            }
            else{
                this.errors.services_catalog_id = 'Seleccione un servicio';
            }
        },

        editPercentDiscount(){
            if(this.discount_percent){
                if(this.discount_percent >= 100){
                    this.errors.discount_percent = 'El porcentaje no puede ser mayor a 100%';
                }
                else{
                    this.errors = {};
                    const value = this.const_price - (this.const_price * (this.discount_percent / 100)) - this.cost - this.external_fee;
                    if(value < 0){
                        this.errors.discount_percent = 'El descuento no puede ser mayor a los honorarios del servicio';
                    }
                    else{
                        this.discount = this.const_price * (this.discount_percent / 100);
                        this.final_price = this.const_price - this.discount;
                        this.fee = this.final_price - this.cost;
                        this.calculateComission();
                    }
                }
            }
        },

        editDiscount(){
            if(this.discount){
                this.errors = {};
                const value = this.const_price - this.cost - this.discount;
                if(value < 0){
                    this.errors.discount = 'El descuento no puede ser mayor a los honorarios del servicio.';
                }
                else{
                    this.final_price = (this.const_price * 1) - (this.discount * 1);
                    this.fee = this.final_price - this.cost;
                    this.discount_percent = Math.round(((this.discount / this.const_price) * 100) *100)/100;
                    this.calculateComission();
                }
            }
        },

        editCost(){
            if(this.cost){
                const value = this.const_price - this.cost - this.discount;
                if(value < 0){
                    this.errors.cost = 'El costo no puede ser mayor al precio del servicio.';
                }
                else{
                    this.errors = {};
                    this.fee = value;
                    this.calculateComission();
                }
            }
        },

        FinalCut(){
            if(this.final_price){
                const value = this.final_price - this.cost - this.discount - this.external_fee;
                if(value < 0){
                    this.errors.final_price = 'El precio no puede ser menor a la suma de pago de derechos + descuento + honorarios';
                }
                else{
                    this.errors = {};
                    this.fee = value;
                    this.const_price = (this.final_price * 1) + (this.discount * 1);
                    this.discount_percent = Math.round(((this.discount / this.const_price) * 100) *100)/100;
                    this.calculateComission();
                }
            }
        },

        async editConversion(){
            if(this.conversion){
                if(this.conversion > 0){
                    await this.$axios.put(`/api/change-money/${this.coin_id}`, {conversion:this.conversion})
                    .then(res => {
                        this.errors = {};
                        this.final_price = Math.round((this.final_price * this.conversion / this.conversion_base) * 100) / 100;
                        this.cost = Math.round((this.cost * this.conversion / this.conversion_base) * 100) / 100;
                        this.discount = Math.round((this.discount * this.conversion / this.conversion_base) * 100) / 100;
                        this.const_price = Math.round((this.const_price * this.conversion / this.conversion_base) * 100) / 100;
                        this.fee = Math.round((this.fee * this.conversion / this.conversion_base) * 100) / 100;
                        this.external_fee = Math.round((this.fee * this.conversion / this.conversion_base) * 100) / 100;
                        this.calculateComission();
                        this.conversion_base = res.data.conversion;
                        this.snackbar = true;
                        this.snackColor = 'success';
                        this.snackText = 'Se actualizó el tipo de cambio para ' + res.data.code;
                        this.timeout = 2000;

                    })
                    .catch(error => {
                        this.errors = error.response.data.errors;
                    })
                }
            }
        },

        calculateComission(){
            if(this.management_comission){
                if(this.management == 0){
                    this.management_value = Math.round((this.management_comission * this.fee) / 100);
                }
                else{
                    this.management_comission = Math.round((this.management_value / this.fee) * 100);
                }
            }

            if(this.sales_comission){
                if(this.management_check == true){
                    if(this.sales == 0){
                        this.sales_comission = this.sales_comission - this.management_comission;
                        this.sales_value = Math.round((this.sales_comission * this.fee) / 100);
                    }
                    else{
                        this.sales_value = this.sales_comission * conversion - this.management_value;
                        this.sales_comission = Math.round((this.sales_value / this.fee) * 100);
                    }
                }
                else if(this.management_check == false){
                    if(this.sales == 0){
                        this.sales_comission = this.sales_comission;
                        this.sales_value = Math.round((this.sales_comission * this.fee) / 100);
                    }
                    else{
                        this.sales_value = this.sales_comission * conversion;
                        this.sales_comission = Math.round((this.sales_value / this.fee) * 100);
                    }
                }
            }

            if(this.operations_comission){
                if(this.operations == 0){
                    this.operations_comission = this.operations_comission;
                    this.operations_value = Math.round((this.operations_comission * this.fee) / 100);
                }
                else{
                    this.operations_value = this.operations_comission * conversion;
                    this.operations_comission = Math.round((this.operations_comission / this.fee) * 100);
                }
            }
        },

        ClearData(){
            this.service_select = true;
            this.services = {};
            this.service_id = '';
            // this.package_id = '';
            this.service = null;
            this.coin_id = '';
            this.cost = 0;
            this.extra_cost = 0;
            this.price = 0;
            this.price_desc = 0;
            this.fee = 0;
            this.external_fee = 0;
            this.conversion = 0;
            this.conversion_base = 0;
            this.discount = 0;
            this.discount_percent = 0;
            this.final_price = 0;
            this.const_price = 0;
            this.const_price = 0;
            this.sales_id = '';
            this.sales_comission = 0;
            this.sales_value = 0;
            this.management_id = '';
            this.management_comission = 0;
            this.management_value = 0;
            this.operations_id = '';
            this.operations_comission = 0;
            this.operations_value = 0;
            this.binnacle_id = '';
            this.process = [];
            this.total_advance = 0;
            this.status_category_id = '';
            this.status_subcategory_id = '';
            //Related
            this.show_related = false;
            // this.related = [];
            this.select_related = '';
            this.related_services = [];
            this.related_ammount = 0;
        },

        ClearService(){
            this.customers = {};
            this.customer = null;
            this.customer_id = '';
            this.date = new Date().toISOString().substr(0, 10);
            this.brands = {};
            this.newBrand = false;
            this.brand_id = '';
            this.class_id = '';
            this.binnacle_id = '';
            this.responsable_id = '';
            this.comment = '';
            this.management_check = false;
            this.sales_check = true;
            this.operations_check = true;
            this.total_advance = 0;
            this.status_category_id = '';
            this.status_subcategory_id = '';
            // this.related = {};
        },

        ReloadService(){
            this.ClearData();
            this.class_id = '';
            this.binnacle_id = '';
            this.comment = '';
            this.total_advance = 0;
            this.status_category_id = '';
            this.status_subcategory_id = '';
        },

        async getClasses(){
            await this.$axios.get('/api/classes-list')
            .then(res => {
                this.classes = res.data;
            })
        },

        async getBinnacles(){
            await this.$axios.get('/api/binnacles-list')
            .then(res => {
                this.binnacles = res.data;
            })
        },

        async getCoins(){
            await this.$axios.get('/api/money-list')
            .then(res => {
                this.coins = res.data;
            })
        },

        async getEstatus(){
            await this.$axios.get('/api/get-categories')
            .then(res => {
                this.status_categories = res.data;
            })
        },

        async getSubcategories(){
            if(this.status_category_id){
                await this.$axios.get(`/api/get-subcategories/${this.status_category_id}`)
                .then(res => {
                    this.status_subcategories = res.data;
                })
            }
        },

        formatPrice(value) {
			let val = (value/1).toFixed(2).replace('.,', '.')
			return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},

        async getResponsables(){
            await this.$axios.get('/api/responsables')
            .then(res => {
                this.responsables = res.data;
            })
        },

        async getRequirements(){
            if(this.services_catalog_id){
                await this.$axios.get(`/api/services/requirements/${this.services_catalog_id}`)
                .then(res => {
                    this.process = res.data;
                    this.total_advance = this.process.length;
                })
            }
        },
        
        clearForm(){
            this.customer_id = '';
            // this.brands = {id:0, brand:'-Sin seleccionar-'}
            // this.this.brand_id = 0;
        },

        async saveBrand(){
            await this.$axios.post('/api/customer/brand', {brand:this.brand, customer_id:this.customer_id})
            .then(res => {
                this.brands.unshift(res.data);
                this.newBrand = false;
                this.brand_id = res.data.id;
                this.brand = '';
                this.errors = {};
                this.snackbar = true;
                this.snackColor = 'success';
                this.snackText = 'Se agregó la marca o nombre comercial';
                this.timeout = 2000;
            })
            .catch(error => {
                this.errors = error.response.data.errors;
            })
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

        async showClass(){
            if(this.class_id){
                await this.$axios.get(`/api/show-class-description/${this.class_id}`)
                .then(res => {
                    this.snackbar = true;
                    this.snackColor = 'purple';
                    this.snackText = res.data.description;
                    this.timeout = 10000;
                })
            }
            else{
                this.snackbar = true;
                this.snackColor = 'warning';
                this.snackText = 'Seleccione una clase';
                this.timeout = 1800;
            }
        },

        async addExtraCosts(){
            if(this.services_catalog_id){
                this.show_related = true;
                await this.$axios.get('/api/services-additional')
                .then(res => {
                    this.related_ammount = this.extra_cost;
                    this.related_services = res.data;
                })
            }
        },

        closeRelated(){
            this.show_related = false;
            this.related_ammount = 0;
            this.extra_cost = 0;
            this.related_services = {};
            this.select_related = '';
        },

        async getRelatedServiceData(){
            await this.$axios.post('/api/service-additional/data', {related_ammount:this.related_ammount, select_related:this.select_related})
            .then(res=> {
                this.related.unshift(res.data);
                this.errors = {};
                this.related_ammount = 0;
                this.select_related = '';
            })
            .catch(error => {
                this.errors = error.response.data.errors;
            })
        },

        deleteRelated: function(index){
            if(this.service_id){
                
            }
            else{
                this.related.splice(index,1);
            }
        },

        async SaveService(){
            if(this.service_id){
                this.loading = true;
                await this.$axios.put(`/api/service/update/${this.service_id}`, {comment:this.comment, date:this.date, cost:this.cost, price:this.price, money_exchange:this.conversion, discount:this.discount, discount_percent:this.discount_percent, final_price:this.final_price, advance_total:this.total_advance, money_exchange_id:this.coin_id, customer_id:this.customer_id, brand_id:this.brand_id, services_catalog_id:this.services_catalog_id, responsable_id:this.responsable_id, binnacle_id:this.binnacle_id, class_id:this.class_id, sales:this.sales, management:this.management, operations:this.operations, sales_comission:this.sales_comission, operations_comission:this.operations_comission, management_comission:this.management_comission, process:this.process, sales_check:this.sales_check, operations_check:this.operations_check, management_check:this.management_check, sales_value:this.sales_value, operations_value:this.operations_value, management_value:this.management_value, status_category_id:this.status_category_id, status_subcategory_id:this.status_subcategory_id, external_fee:this.external_fee, utility:this.fee, has_package:this.has_package, package_id:this.package_id, package_total:this.package_total})
                .then(res => {
                    this.errors = {};
                    this.snackbar = true;
                    this.snackColor = 'success';
                    this.snackText = 'Se editó el servicio exitosamente';
                    this.timeout = 3000;
                    this.$emit('updateService', res.data);
                    this.loading = false;
                    this.ReloadService();
                    this.service_dialog = false;
                })
                .catch(error => {
                    // console.clear();
                    this.errors = error.response.data.errors;
                    this.snackbar = true;
                    this.snackColor = 'error';
                    this.snackText = 'No se pudo actualizar el servicio, revise los errores en el formulario.';
                    this.timeout = 2000;
                    this.loading = false;
                })
            }
            else{
                this.loading = true;
                await this.$axios.post('/api/service/store', {comment:this.comment, date:this.date, cost:this.cost, price:this.price, money_exchange:this.conversion, discount:this.discount, discount_percent:this.discount_percent, final_price:this.final_price, advance_total:this.total_advance, money_exchange_id:this.coin_id, customer_id:this.customer_id, brand_id:this.brand_id, services_catalog_id:this.services_catalog_id, responsable_id:this.responsable_id, binnacle_id:this.binnacle_id, class_id:this.class_id, sales:this.sales, management:this.management, operations:this.operations, sales_comission:this.sales_comission, operations_comission:this.operations_comission, management_comission:this.management_comission, process:this.process, sales_check:this.sales_check, operations_check:this.operations_check, management_check:this.management_check, sales_value:this.sales_value, operations_value:this.operations_value, management_value:this.management_value, status_category_id:this.status_category_id, status_subcategory_id:this.status_subcategory_id, external_fee:this.external_fee, utility:this.fee, has_package:this.has_package, package_id:this.package_id, related_ammount:this.related_ammount, select_related:this.select_related})
                .then(res => {
                    this.errors = {};
                    this.related = res.data.services;
                    this.package_id = res.data.package_id;
                    this.$emit('addService', res.data.service.original);
                    if(this.select_related){
                        this.$emit('addService', res.data.service_related.original);
                    }
                    this.snackbar = true;
                    this.snackColor = 'success';
                    this.snackText = 'Se creó el servicio exitosamente';
                    this.timeout = 3000;
                    this.loading = false;
                    this.ReloadService();
                    if(!this.has_package){
                        this.service_dialog = false;
                    }
                })
                .catch(error => {
                    // console.clear();
                    this.errors = error.response.data.errors;
                    this.snackbar = true;
                    this.snackColor = 'error';
                    this.snackText = 'No se pudo generar el servicio, revise los errores en el formulario.';
                    this.timeout = 2000;
                    this.loading = false;
                })
            }
        }
    }
}
</script>