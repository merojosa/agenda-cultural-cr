type Mock = {
	name: string;
	description: string;
	image: string;
	date: Date;
};

const mockData: Mock[] = [
	{
		name: 'Hamlet',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sagittis lacinia sagittis. Aliquam at condimentum neque. Ut quis tincidunt neque.',
		image:
			'https://www.hollywoodreporter.com/wp-content/uploads/2015/08/hamlet_at_the_barbican_theatre_production_still.jpg',
		date: new Date('2023-01-01')
	},
	{
		name: 'La Casa de Bernarda Alba y chispas, esto es largo jeje',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porta ipsum vel justo commodo tincidunt. Integer auctor, turpis non pellentesque volutpat, sem libero tristique magna.',
		image:
			'https://cinemagavia.es/wp-content/uploads/2021/07/La-casa-de-Bernarda-Alba-de-Miquel-Ortega.jpeg',
		date: new Date('2023-01-01')
	},
	{
		name: 'Romeo y Julieta',
		description:
			'Maecenas a orci placerat, tempus risus finibus, maximus erat. Ut id dolor enim. Vestibulum nibh enim, ornare a arcu eget, viverra sodales neque. Fusce quis massa at nisl sollicitudin auctor eu ac erat. Nulla malesuada sodales imperdiet.',
		image:
			'https://cdn0.unprofesor.com/es/posts/6/4/1/resumen_de_romeo_y_julieta_por_actos_3146_600.jpg',
		date: new Date('2023-01-01')
	},
	{
		name: 'Cuarto para las seis',
		description:
			'Vivamus vestibulum, elit pretium cursus eleifend, odio lorem venenatis felis, non vehicula magna ligula in nulla. Praesent pellentesque tristique orci. Sed pulvinar porttitor enim non porta.',
		image: 'https://boleteria.teatronacional.go.cr/uplimage/Cuartopara6.jpg',
		date: new Date('2023-01-01')
	}
];

export function load() {
	return { mockData };
}
