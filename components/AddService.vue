<template>
    <div>
        <v-dialog v-model="service_dialog" fullscreen transition="dialog-bottom-transition" scrollable>
			<v-form @submit.prevent="Save">
				<v-card>
					<v-card-title class="primary white--text">
						{{title}}
						<v-spacer></v-spacer>
						<v-btn icon @click="service_dialog = false"><v-icon>close</v-icon></v-btn>
					</v-card-title>
					<v-card-text class="mb-4">
						<v-container fluid>
							<v-row>
								<v-col cols="12" sm="12" md="4" lg="2">
									<v-text-field v-model="code" outlined label="Clave *" :error-message="errors.code"></v-text-field>
								</v-col>
                                <v-col cols="12" sm="12" md="8" lg="10">
									<v-text-field v-model="service" outlined label="Nombre del servicio *" :error-message="errors.code"></v-text-field>
								</v-col>
							</v-row>
                            <!-- <v-row>
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
                                    <v-autocomplete v-model="service" :items="services" outlined :loading="serviceLoading" :search-input.sync="sync_service" hide-no-data hide-selected item-text="service" item-value="id" placeholder="Buscar servicio..." return-object :error-messages="errors.services_catalog_id" label="Servicio" append-outer-icon="refresh" append-icon="clear" @click:append="ClearData" @click:append-outer="getServiceData"></v-autocomplete>
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
                                                    <v-checkbox @change="updateComissions" color="primary" v-model="sales_check"></v-checkbox>
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
                                                    <v-checkbox color="primary" v-model="management_check" @change="updateComissions"></v-checkbox>
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
								<v-btn large color="success" :loading="loading" @click="StoreService">Guardar<v-icon right>save</v-icon></v-btn>
							</v-row> -->
                            <br>
                            <!-- <v-simple-table class="elevation-4">
                                <thead>
                                    <tr>
                                        <th class="text-left">Fecha</th>
                                        <th class="text-left">Servicio</th>
                                        <th class="text-left">Precio</th>
                                        <th class="text-left">Resp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(service, index) in services_collection" :key="index">
                                        <td title="service.id">{{ service.date }}</td>
                                        <td>{{ service.code }} - {{ service.brand }}<span v-if="service.class"> {{service.class}}</span></td>
                                        <td>{{ service.final_price }}</td>
                                        <td>{{ service.resp }}</td>
                                    </tr>
                                </tbody>
                            </v-simple-table> -->
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
            //form
            service_dialog:false,
            title:'',
            errors:[],
            //Data
            code:'',
            service:'',
            //snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
			timeout: 6000,
        }
    },

    methods:{
        addService(){
            this.service_dialog = true;
            this.title = 'Agregar servicio';
        }
    }
}
</script>