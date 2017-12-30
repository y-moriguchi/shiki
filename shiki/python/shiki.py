#
# shikiml
#
# Copyright (c) 2017 Yuichiro MORIGUCHI
#
# This software is released under the MIT License.
# http://opensource.org/licenses/mit-license.php
#
from docutils import nodes
from docutils.parsers.rst import Directive
import subprocess

class shiki(nodes.General, nodes.Element):
	pass

class ShikiDirective(Directive):
	"""Directive for Shiki"""

	has_content = True
	required_arguments = 0
	optional_arguments = 0
	option_spec = {
	}

	def run(self):
		content = '';
		for line in self.content.xitems():
			content += line[2]
			content += '\n'
		content.rstrip()
		node = shiki(content=content)
		return [node]

def invoke_shiki(self, node):
	try:
		pipe = subprocess.Popen(["shikiml", "-"],
		  stdin=subprocess.PIPE,
		  stdout=subprocess.PIPE,
		  stderr=subprocess.PIPE)
		stdout_data, stderr_data = pipe.communicate(node['content'])
	except:
		self.builder.warn('fail to parse shiki')
		raise nodes.SkipNode
	if pipe.returncode > 0:
		self.builder.warn(stderr_data)
		raise nodes.SkipNode
	return stdout_data.decode()

def visit_shiki_node_html(self, node):
	self.body.append(invoke_shiki(self, node))

def visit_shiki_node_latex(self, node):
	self.body.append("\n")
	self.body.append(invoke_shiki(self, node))

def depart_shiki_node(self, node):
    pass

def setup(app):
	app.add_node(shiki,
	             html=(visit_shiki_node_html, depart_shiki_node),
	             latex=(visit_shiki_node_latex, depart_shiki_node))
	app.add_directive('shiki', ShikiDirective)
