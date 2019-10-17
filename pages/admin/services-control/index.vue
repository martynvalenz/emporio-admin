<template>
	<div>
		<h2>Control de Servicios</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="services_loading">
					<v-card-title>
						<v-btn color="primary" class="mx-1">Agregar Servicio<v-icon right>add</v-icon></v-btn>
						<v-btn color="info" class="mx-1">Agregar Cliente<v-icon right>person_add</v-icon></v-btn>
						<v-spacer></v-spacer>
						<v-btn icon @click="Refresh"><v-icon>sync</v-icon></v-btn>
					</v-card-title>
					<v-card-text >
						<v-simple-table class="elevation-1" >
							<thead>
								<tr>
									<th class="text-left">Fecha</th>
									<th class="text-left">Servicio</th>
									<th class="text-left">Cliente</th>
									<th class="text-left">Factura</th>
									<th class="text-left">Recibo</th>
									<th class="text-left">Precio</th>
									<th class="text-left">Saldo</th>
									<th class="text-left">Resp</th>
									<th class="text-left">Trámite</th>
									<th class="text-right"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(service, index) in services" :key="index">
									<td>{{ service.service }}</td>
									<td v-if="service.referred_by">Ref: {{ service.referral }}</td>
									<td v-else>{{ service.strategy }}</td>
									<td>{{ service.balance }}</td>
									<td>{{ service.initials }}</td>
									<td>
										<v-chip v-if="service.status" color="green" dark>Activo</v-chip>
										<v-chip v-else dark color="red">Inactivo</v-chip>
									</td>
									<td>{{ service.created_at }}</td>
									<td class="text-right">
										<v-icon color="grey">all_inbox</v-icon>
										<v-icon color="grey">list</v-icon>
										<v-icon color="grey" @click="openBrands(service.id)">copyright</v-icon>
										<v-icon color="grey" @click="openContacts(service.id)">person</v-icon>
										<v-icon v-if="service.folder" @click="openFolder(service.folder)" color="success">folder</v-icon>
										<v-icon v-else @click="editFolder(index)" color="grey">folder</v-icon>
										<v-icon icon @click="edit(index)" color="warning">edit</v-icon>
										<v-icon @click="statusModal(index)" v-if="service.status" color="error">block</v-icon>
										<v-icon @click="statusModal(index)" v-else color="success">check</v-icon>
									</td>
								</tr>
							</tbody>
						</v-simple-table>
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import axios from 'axios'
export default{
	layout: 'admin',
	middleware: 'auth',
	head:{
        title: 'Clientes'
	},

	data(){
		return{
			//Data
			services:[],
			services_loading:false
		}
	},

	methods:{

	}
}
</script>	