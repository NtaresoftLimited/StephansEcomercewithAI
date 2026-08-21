const { createClient } = require('@sanity/client'); const client = createClient({ projectId: 'ubqcgegx', dataset: 'production', useCdn: false, apiVersion: '2023-01-01' }); client.fetch('*[_type == \
category\]{name, \slug\: slug.current}').then(console.log);
