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
					<v-card-text class="mb-4">
						<v-container fluid>
							<v-row>
								<v-col cols="12" sm="12" md="7" lg="6">
									<v-autocomplete v-model="customer" :items="customers" outlined :loading="customerLoading" :search-input.sync="sync_customer" hide-no-data hide-selected item-text="customer" item-value="id" placeholder="Buscar cliente..." return-object :error-messages="errors.customer_id" label="Cliente" append-icon="clear" @click:append="ClearCustomer"></v-autocomplete>
								</v-col>
                                <v-spacer></v-spacer>
                                <v-col cols="12" sm="12" md="4" lg="2">
                                    <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y full-width min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="date" label="Fecha" append-icon="event" outlined readonly v-on="on" @click:append="date_menu = true"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="date" locale="es" color="light-blue darken-3" @input="date_menu = false"></v-date-picker>
                                    </v-menu>
                                </v-col>
							</v-row>
                            <v-row>
                                <v-col cols="12" sm="12" md="10" lg="10">
                                    <v-select v-if="!newBrand" v-model="brand_id" outlined :items="brands" item-value="id" item-text="brand" label="Seleccionar Marca o aviso comercial" :error-messages="errors.brand_id" prepend-icon="add" @click:prepend="newBrand = true" clearable></v-select>
                                    <v-text-field v-else v-model="brand" prepend-icon="close" @click:prepend="newBrand = false" append-icon="save" @click:append="saveBrand" outlined label="Agregar marca o aviso comercial" :error-messages="errors.brand"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="2" lg="2">
                                    <v-select v-model="class_id" outlined :items="classes" item-value="id" item-text="class" label="Clase" :error-messages="errors.class_id" clearable append-outer-icon="help_outline" @click:append-outer="showClass"></v-select>
                                </v-col>
                            </v-row>
							<v-row>
								<v-col cols="12" sm="12" md="10" lg="10">
                                    <v-autocomplete v-model="service" :items="services" outlined :loading="serviceLoading" :search-input.sync="sync_service" hide-no-data hide-selected item-text="service" item-value="id" placeholder="Buscar servicio..." return-object :error-messages="errors.service_id" label="Servicio" append-outer-icon="refresh" append-icon="clear" @click:append="ClearData" @click:append-outer="getServiceData"></v-autocomplete>
                                </v-col>
							</v-row>
                            <v-row>
                                <v-col cols="12" sm="12" md="4" lg="3">
                                    <v-select v-model="binnacle_id" outlined :items="binnacles" item-value="id" item-text="binnacle" label="Seleccionar Bitácora" :error-messages="errors.binnacle_id" clearable></v-select>
                                </v-col>
                                <v-col cols="12" sm="12" md="4" lg="3">
                                    <v-select v-model="responsable_id" outlined :items="responsables" item-value="id" item-text="user" label="Seleccionar Responsable" :error-messages="errors.responsable_id" clearable></v-select>
                                </v-col>
                            </v-row>
                            <hr>
                            <br>
                            <v-row>
                                <v-col cols="12" sm="6" md="3" lg="2">
                                    <v-select v-model="coin_id" :items="coins" item-value="id" item-text="coin" outlined label="Moneda" @change="changeCoin" readonly></v-select>
                                </v-col>
                                <v-col cols="12" sm="6" md="3" lg="2">
                                    <v-text-field v-model="cost" type="number" step="any" outlined label="Costo Emporio" append-icon="refresh" :error-messages="errors.cost" v-on:keyup="editCost" @click:append="editCost"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="3" lg="2">
                                    <v-text-field v-model="price_desc" outlined label="Precio base" readonly></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="3" lg="2">
                                    <v-text-field v-model="fee" readonly type="number" step="any" outlined label="Honorarios"></v-text-field>
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
                            <hr>
                            <br>
                            <v-row>
                                <v-col cols="12" xs="12">
                                    <h3>Comisiones <v-btn icon @click="calculateComission"><v-icon>refresh</v-icon></v-btn></h3>
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
                                                    <v-checkbox @change="salesCheck" color="primary" v-model="sales_check"></v-checkbox>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Operativa</td>
                                                <td class="text-right">% {{operations_comission}}</td>
                                                <td class="text-right">$ {{operations_value}}</td>
                                                <td>
                                                    <v-checkbox color="primary" v-model="operations_check"></v-checkbox>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Gestión</td>
                                                <td class="text-right">% {{management_comission}}</td>
                                                <td class="text-right">$ {{management_value}}</td>
                                                <td>
                                                    <v-checkbox color="primary" v-model="management_check" @change="managementCheck"></v-checkbox>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-simple-table>
                                </v-col>
                            </v-row>
                            <v-row>
								<v-col cols="12" sm="12" md="12" lg="12">
                                    <v-textarea v-model="comments" label="Comentarios (opcional)" outlined solo></v-textarea>
                                </v-col>
							</v-row>
                            <v-row>
								<v-btn large color="success">Guardar<v-icon right>save</v-icon></v-btn>
							</v-row>
                            <br>
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
            <!-- <v-btn
                color="white"
                text
                @click="snackbar = false"
                >
                Cerrar
            </v-btn> -->
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
            brand:'',
            newBrand:false,
            classes:[],
            class_id:'',
            comments:'',
            coins:'',
            coin_id:'',
            cost:0,
            price:0,
            price_desc:'',
            final_price:0,
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
            sales_comission:0,
            management_comission:0,
            operations_comission:0,
            sales:0,
            management:0,
            operations:0,
            sales_value:0,
            management_value:0,
            operations_value:0,
            sales_check:true,
            management_check:false,
            operations_check:true,
            binnacles:[],
            binnacle_id:'',
            responsables:[],
            responsable_id:'',
            process:[],


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
            this.getBinnacles();
            this.getResponsables();
            this.getCoins();
            this.ClearService();
            this.ClearData();
        },
        
        customerSelect(val){
			this.customerLoading = true;
			this.$axios.post('/api/service/customers', {search:val})
			.then(res => {
				this.customers = res.data.data;
                this.customer_id = this.customer.id;
                this.getBrands();
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

        serviceSelect(val){
			this.serviceLoading = true;
			this.$axios.post('/api/services/list', {search:val})
			.then(res => {
				this.services = res.data;
                this.service_id = this.service.id;
                this.getServiceData();
                this.getProcess();
                this.serviceLoading = false;
                this.errors = {};
			})
			.catch(error => {
				console.log(error);
				this.serviceLoading = false;
			})
        },

        async getBrands(){
            await this.$axios.post('/api/service/customer-brands', {customer_id:this.customer_id})
            .then(res => {
                this.brands = res.data;
            })
            .catch(error => {
                this.errors = error.response.data.errors;
            })
        },

        changeCoin(){
            let coin = this.coins[this.coin_id -1];
            this.conversion = coin.conversion;
            this.editConversion();
        },

        managementCheck(){

        },

        salesCheck(){

        },

        async getServiceData(){
            if(this.service_id){
                await this.$axios.post('/api/services/data', {id:this.service_id, customer_id:this.customer_id})
                .then(res => {
                    this.errors = {};
                    const conversion = res.data.service.conversion;
                    //General Data
                    this.binnacle_id = res.data.service.binnacle_id;
                    this.status_category_id = res.data.service.status_category_id;
                    this.status_subcategory_id = res.data.service.status_subcategory_id;
                    this.coin_id = res.data.service.money_exchange_id;
                    this.total_advance = res.data.service.total_advance;
                    this.price_desc = res.data.service.price + ' ' + res.data.service.code;
                    this.price = res.data.service.price;

                    //Discounts
                    const discount = (res.data.service.price * conversion) * ((res.data.discount * conversion) / 100);
                    this.discount_percent = res.data.discount;
                    this.discount = discount;

                    //Totals
                    this.conversion = conversion;
                    this.conversion_base = conversion;
                    this.cost = res.data.service.cost * conversion;
                    this.final_price = (res.data.service.price * conversion) - discount;
                    this.const_price = (res.data.service.price * conversion) - discount;
                    this.fee = Math.round(((res.data.service.price * conversion) - (res.data.service.cost * conversion) - discount) * 100)/100;

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
                        if(this.management_check == true){
                            if(res.data.service.sales == 0){
                                this.sales_comission = res.data.service.sales_comission - res.data.service.management_comission;
                                this.sales_value = Math.round((res.data.service.sales_comission * this.fee) / 100);
                            }
                            else{
                                this.sales_value = res.data.service.sales_comission * conversion - this.management_value;
                                this.sales_comission = Math.round((this.sales_value / this.fee) * 100);
                            }
                        }
                        else if(this.management_check == false){
                            if(res.data.service.sales == 0){
                                this.sales_comission = res.data.service.sales_comission;
                                this.sales_value = Math.round((res.data.service.sales_comission * this.fee) / 100);
                            }
                            else{
                                this.sales_value = res.data.service.sales_comission * conversion;
                                this.sales_comission = Math.round((this.sales_value / this.fee) * 100);
                            }
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
                })
            }
            else{
                this.errors.service_id = 'Seleccione un servicio';
            }
        },

        editPercentDiscount(){
            if(this.discount_percent){
                if(this.discount_percent >= 100){
                    this.errors.discount_percent = 'El porcentaje no puede ser mayor a 100%';
                }
                else{
                    this.errors = {};
                    const value = this.const_price - (this.const_price * (this.discount_percent / 100)) - this.cost;
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
                const value = this.final_price - this.cost - this.discount;
                if(value < 0){
                    this.errors.final_price = 'El precio no puede ser menor a la suma de costos y descuentos';
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

        async getProcess(){
            if(this.service_id){

            }
        },

        ClearData(){
            this.services = {};
            this.service_id = '';
            this.service = null;
            this.coin_id = '';
            this.cost = 0;
            this.price = 0;
            this.price_desc = 0;
            this.fee = 0;
            this.conversion = 0;
            this.conversion_base = 0;
            this.discount = 0;
            this.discount_percent = 0;
            this.final_price = 0;
            this.const_price = 0;
            this.const_price = 0;
            this.sales_comission = 0;
            this.sales_value = 0;
            this.management_comission = 0;
            this.management_value = 0;
            this.operations_comission = 0;
            this.operations_value = 0;
            this.binnacle_id = '';
            this.process = [];
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
            this.comments = '';
            this.management_check = false;
            this.sales_check = true;
            this.operations_check = true;
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

        async getResponsables(){
            await this.$axios.get('/api/responsables')
            .then(res => {
                this.responsables = res.data;
            })
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
                    this.snackColor = 'info';
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
        }
    }
}
</script>